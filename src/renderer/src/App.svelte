<script lang="ts">
    import { ipcRenderer, type DesktopCapturerSource } from "electron";
    import Recorder from "./pages/Recorder.svelte";
    import Screens from "./pages/Screens.svelte";
    import Settings from "./pages/Settings.svelte";

    export let window_name: string;

    enum Windows {
        MAIN = 'main',
        SCREENS = 'screens',
        SETTINGS = 'settings'
    }

    let sourceId: string;

    async function getSources(): Promise<DesktopCapturerSource[]> {
        return await ipcRenderer.invoke('GET_SOURCES')
            .then(response => {
                sourceId = response[0].id;
                return response;
            });
    }

    ipcRenderer.on('SOURCE_UPDATED', (_event, displayId) => {
        sourceId = displayId;
    });
</script>

<main class="grid h-dvh w-dvw relative">
    {#await getSources()}
        <h1>loading</h1>
    {:then inputSources}
        {#if window_name === Windows.MAIN}
            <Recorder {sourceId} {inputSources} />
        {:else if window_name === Windows.SCREENS}
            <Screens {sourceId} {inputSources} />
        {:else if window_name === Windows.SETTINGS}
            <Settings />
        {/if}
    {/await}
</main>
