import { ipcRenderer } from 'electron';
import nativeStream from 'stream';
import FfmpegCommand from 'fluent-ffmpeg';
import { path } from '@ffmpeg-installer/ffmpeg';
import { deleteInterval } from './'; 

let recordedChunks: Blob[] = [];

export function createMediaRecorder(stream: MediaStream, audioEnabled: boolean) {
    const options = {
        mimeType: 'video/webm; codecs=vp9'
    };
    stream.getAudioTracks()[0].enabled = audioEnabled;
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = onDataAvailable;
    mediaRecorder.onstop = stopRecording;
    return mediaRecorder;
};

function loadFfmpeg() {
    const ffmpeg = FfmpegCommand();
    ffmpeg.setFfmpegPath(path.replace('app.asar', 'app.asar.unpacked'));

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

async function stopRecording(): Promise<void> {
    deleteInterval();
    const date_time = /(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/.exec(new Date().toISOString());
    const filename = `${date_time[1]}_${date_time[2].replace(/:/g, '-')}`;
    const blob = new Blob(recordedChunks, { type: 'video/webm; codecs=vp9' });
    const buffer = Buffer.from(await blob.arrayBuffer());

    const { canceled, filePath } = await ipcRenderer.invoke('SHOW_SAVE_DIALOG', { name: filename, format: 'mp4' });
    if (canceled) return;

    if (filePath) {
        const ffmpeg = loadFfmpeg();
        const readableVideoBuffer = createReadableVideoBuffer(buffer);

        ffmpeg
            .input(readableVideoBuffer)
            .output(filePath)
            .run();
    }
    recordedChunks = [];
}
