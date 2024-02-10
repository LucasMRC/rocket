<script lang="ts" type="module">
    import { ipcRenderer, type DesktopCapturerSource } from 'electron';
    import { writeFile } from 'fs';
    import { createInterval, deleteInterval, formatTime } from '../utils';
    import RecordButton from '../components/RecordButton.svelte';
    import Icon from '../components/Icon.svelte';
    import screenIcon from '../assets/screen-filled-svgrepo-com.png';
    import audioIcon from '../assets/mic-fill-svgrepo-com.png';
    import muteIcon from '../assets/mic-slash-fill-svgrepo-com.png';
    export let sourceId: string;
    export let inputSources: DesktopCapturerSource[];

    let mediaRecorder: MediaRecorder;
    let stream: MediaStream;
    let recordedChunks: Blob[] = [];
    const format = 'video/webm';
    let recording = false;
    let audioEnabled = false;
    let timeRecording = 0;
    let panelOpened = true;

    $: sourceIndex = inputSources.findIndex(source => source.id === sourceId) + 1;
    $: formattedTime = formatTime(timeRecording);
    $: {
        const constraints = {
            audio: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId
                }
            },
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: sourceId
                }
            }
        };

        navigator.mediaDevices
            .getUserMedia(constraints as unknown)
            .then(response => {
                stream = response;
            });
    }

    const createMediaRecorder = () => {
        const options = { mimeType: format };
        mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.ondataavailable = onDataAvailable;
        mediaRecorder.onstop = stopRecording;
    };

    async function startRecording(): Promise<void> {
        recording = true;
        createMediaRecorder();
        createInterval(() => ++timeRecording, 1000);
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

        const { canceled, filePath } = await ipcRenderer.invoke('SHOW_SAVE_DIALOG');
        timeRecording = 0;
        if (canceled) return ;

        if (filePath) {
            writeFile(filePath, buffer, () => {
                console.debug('video saved successfully!');
            });
        }
    }

    function updateAudio(e: Event) {
        const { checked } = e.target as HTMLInputElement;
        audioEnabled = checked;

        if (stream) {
            stream.getAudioTracks()[0].enabled = checked;
        }
    }

    function openSecondaryWindow(screen: string) {
        ipcRenderer.invoke('SECONDARY_WINDOW', { action: 'open', screen });
    }

    function togglePanel() {
        panelOpened = !panelOpened;
    }
</script>

<section class="my-auto ml-8 flex items-center select-none">
    <RecordButton
        start={startRecording}
        stop={() => {
            mediaRecorder?.stop();
            recording = false;
        }}
        disabled={!sourceId}
        recording={recording}
    />
    <div class={`flex border border-slate-500 gap-1 transition-all items-center ${panelOpened ? 'w-[75%]' : 'w-[5%]'} rounded-md pr-1 py-[0.2rem] pl-2 bg-gradient-to-r from-slate-900 to-slate-950 relative z-10`}>
        <label class="cursor-pointer">
            <input checked={audioEnabled} type="checkbox" name="mic" on:change={updateAudio} hidden />
            <img src={audioEnabled ? audioIcon : muteIcon} alt="audio toggle" class={`scale-[0.9] w-6 h-6 relative top-[0.4px]${audioEnabled ? ' right-[0.75px]' : ''}`}/>
        </label>
        {#if !recording}
            <div class="flex items-center relative">
                <p class="text-[0.5rem] leading-[1] bottom-0 text-slate-900 text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold pointer-events-none">{panelOpened ? sourceIndex : ''}</p>
                <button class="cursor-pointer" on:click={() => openSecondaryWindow('screens')} disabled={!inputSources.length}>
                    <img src={screenIcon} alt="selected screen" class="w-6 h-6" />
                </button>
            </div>
            <!-- <button class="cursor-pointer" on:click={() => openSecondaryWindow('settings')} disabled={recording}>
                <Icon icon="settings" />
            </button> -->
        {:else}
            <p class={`text-xs text-indigo-300 transition-opacity absolute right-2 ${panelOpened ? 'opacity-100' : 'opacity-0'}`}>{formattedTime}</p>
        {/if}
        <button class="z-20 cursor-pointer absolute -right-3 grid content-center rounded size-4" on:click={togglePanel}>
            <Icon icon="chevron" />
        </button>
    </div>
</section>
