import { ipcRenderer } from 'electron';
import nativeStream from 'stream';
import { deleteInterval } from './'; 
import log from 'electron-log/renderer';

// @ts-ignore: Importing as ES6 doesn't work
const FfmpegCommand = require('fluent-ffmpeg');
// @ts-ignore: Importing as ES6 doesn't work
const { path: ffmpegPath } = require('@ffmpeg-installer/ffmpeg');

let recordedChunks: Blob[] = [];

export function createMediaRecorder(stream: MediaStream, audioEnabled: boolean, onFinished: () => void) {
    const options = {
        mimeType: 'video/webm; codecs=vp9'
    };
    stream.getAudioTracks()[0].enabled = audioEnabled;
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = onDataAvailable;
    mediaRecorder.onstop = () => stopRecording(onFinished);
    return mediaRecorder;
};

function loadFfmpeg() {
    const ffmpeg = FfmpegCommand();
    const ffmpegStaticPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');
    ffmpeg.setFfmpegPath(ffmpegStaticPath);

    return ffmpeg;
}

function createReadableVideoBuffer(buffer: Buffer) {
    const readableVideoBuffer = new nativeStream.PassThrough();
    readableVideoBuffer.write(buffer);
    readableVideoBuffer.end();

    return readableVideoBuffer;
}

function onDataAvailable(e: BlobEvent): void {
    recordedChunks.push(e.data);
}

async function stopRecording(callback: () => void): Promise<void> {
    deleteInterval();
    const date_time = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/.exec(new Date().toISOString());
    const filename = `${date_time[1]}_${date_time[2].replace(/:/g, '-')}`;
    const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp9' });
    const buffer = Buffer.from(await blob.arrayBuffer());
    const ffmpeg = loadFfmpeg();
    const readableVideoBuffer = createReadableVideoBuffer(buffer);

    const { canceled, filePath } = await ipcRenderer.invoke('SHOW_SAVE_DIALOG', { name: filename, format: 'mp4' });
    if (canceled) return callback();
    else if (filePath) {
        let timer: number;
        ffmpeg
            .input(readableVideoBuffer)
            .outputOptions('-max_muxing_queue_size', '9999', '-r', '10')
            .on('error', function(err: Error) {
                log.error(err.message);
                callback();
            })
            .on('start', function() {
                timer = Date.now();
                log.info('Started processing video', filePath);
            })
            .on('end', function() {
                const timeToProcess = ((Date.now() - timer) / 1000).toFixed(2);
                log.info(`Processing finished in ${timeToProcess} seconds`);
                callback();
            })
            .output(filePath)
            .run();
    }
    recordedChunks = [];
}
