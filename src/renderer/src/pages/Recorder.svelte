<script lang="ts">
    import { ipcRenderer, type DesktopCapturerSource } from 'electron';
    import { writeFile } from 'fs';
    import { createInterval, deleteInterval, formatTime } from '../utils';
    import RecordButton from '../components/RecordButton.svelte';
    import Icon from '../components/Icon.svelte';

    export let sourceId: string;
    export let sourceIndex: string;
    export let inputSources: DesktopCapturerSource[];

    let mediaRecorder: MediaRecorder;
    let stream: MediaStream;
    let recordedChunks: Blob[] = [];
    const format = 'video/webm; codecs="vp9"';
    let recording = false;
    let audioEnabled = false;
    let timeRecording = 0;

    $: formattedTime = formatTime(timeRecording);

    async function startRecording(): Promise<void> {
        // Audio won't work on MACOS
        // const IS_MACOS =
        //     (await ipcRenderer.invoke('getOperatingSystem')) === 'darwin';
        recording = true;

        createInterval(() => ++timeRecording, 1000);

        stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId
                }
            },
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId,
                    minWidth: 1280,
                    maxWidth: 1280,
                    minHeight: 720,
                    maxHeight: 720
                }
            }
        } as unknown);

        console.log(stream);

        if (!audioEnabled) stream.getAudioTracks()[0].enabled = false;

        mediaRecorder = new MediaRecorder(stream, {
            mimeType: format
        });
        mediaRecorder.ondataavailable = onDataAvailable;
        mediaRecorder.onstop = stopRecording;
        // ipcRenderer.invoke('resizeWindow', 'recording');
        mediaRecorder.start();
    }

    function onDataAvailable(e: BlobEvent): void {
        recordedChunks.push(e.data);
    }

    async function stopRecording(): Promise<void> {
        deleteInterval();
        const blob = new Blob(recordedChunks, {
            type: recordedChunks[0].type
        });

        const buffer = Buffer.from(await blob.arrayBuffer());
        recordedChunks = [];

        const { canceled, filePath } = await ipcRenderer.invoke('showSaveDialog');
        timeRecording = 0;
        stream = null;
        if (canceled) return ;

        if (filePath) {
            writeFile(filePath, buffer, () => {
                console.log('video saved successfully!');
                // ipcRenderer.invoke('resizeWindow', 'standby');
            });
        }
    }

    function updateAudio(e: Event) {
        const { checked } = e.target as HTMLInputElement;
        audioEnabled = checked;

        if (stream) stream.getAudioTracks()[0].enabled = checked;
    }

    function openScreenWindow() {
        ipcRenderer.invoke('secondaryWindow', { action: 'open' });
    }

    function hola() {
        console.log('hola');
    }
</script>

<section class="h-[30px] my-auto ml-10 w-[100px] flex items-center select-none">
    <RecordButton
        start={startRecording}
        stop={() => {
            mediaRecorder?.stop();
            recording = false;
        }}
        disabled={!sourceId}
        recording={recording}
    />
    <div class="flex gap-2 items-center w-full rounded-md p-1 pl-2 bg-gradient-to-r from-slate-900 to-slate-950">
        <label>
            <input type="checkbox" name="mic" on:change={updateAudio} hidden />
            <Icon icon={audioEnabled ? 'audio-on' : 'audio-off'} />
        </label>
        {#if !recording}
            <div class="flex items-center justify-between gap-2 relative">
                <p class="text-[0.5rem] leading-[1] bottom-0 text-slate-900 text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold pointer-events-none">{sourceIndex}</p>
                <button class="cursor-pointer" on:click={openScreenWindow} disabled={!inputSources.length}>
                    <Icon icon="display" />
                </button>
            </div>
            <button class="cursor-pointer" on:click={hola} disabled={recording}>
                <Icon icon="settings" />
            </button>
        {:else}
            <p class="text-sm text-indigo-300">{formattedTime}</p>
        {/if}
    </div>
</section>
