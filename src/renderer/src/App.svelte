<script lang="ts">
    import { ipcRenderer, type DesktopCapturerSource } from "electron";
    import Recorder from "./pages/Recorder.svelte";
    import Screens from "./pages/Screens.svelte";
    import log from 'electron-log/renderer';
    import electron from 'electron';

    export let window_name: string;

    enum Windows {
        MAIN = 'main',
        SCREENS = 'screens',
        SETTINGS = 'settings'
    }

    let sourceId: string;
    let inputSources: DesktopCapturerSource[] = [];

    // Log unhandled errors
    log.errorHandler.startCatching({
        showDialog: false,
        onError({ error, processType }) {
            log.error(processType, error.message);
            electron.dialog.showMessageBox({
                title: 'An error occurred',
                message: error.message,
                detail: error.stack,
                type: 'error',
                buttons: ['Ignore', 'Exit'],
            })
                .then((result) => {
                    if (result.response === 1) {
                        electron.app.quit();
                    }
                });
        }
    });

    ipcRenderer.invoke('GET_SOURCES').then(sources => {
        sourceId = sources[0].id;
        inputSources = sources;
    });

    ipcRenderer.on('SOURCE_UPDATED', (_event, displayId) => {
        sourceId = displayId;
    });
</script>

<main class="grid h-dvh w-dvw relative">
    {#if window_name === Windows.MAIN}
        <Recorder {sourceId} {inputSources} />
    {:else if window_name === Windows.SCREENS}
        <Screens {sourceId} {inputSources} />
    {/if}
</main>
