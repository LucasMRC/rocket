<script lang="ts">
    import { ipcRenderer, type DesktopCapturerSource } from "electron";
    import Recorder from "./pages/Recorder.svelte";
    import Screens from "./pages/Screens.svelte";
    // import Settings from "./pages/Settings.svelte";

    export let window_name: string;

    enum Windows {
        MAIN = 'main',
        SCREENS = 'screens',
        SETTINGS = 'settings'
    }

    let sourceId: string;
    let inputSources: DesktopCapturerSource[] = [];

    async function getSources(): Promise<DesktopCapturerSource[]> {
        return await ipcRenderer.invoke('GET_SOURCES')
            .then(response => {
                sourceId = response[0].id;
                return response;
            });
    }

    getSources().then(sources => {
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
    <!-- {:else if window_name === Windows.SETTINGS}
        <Settings /> -->
    {/if}
</main>
