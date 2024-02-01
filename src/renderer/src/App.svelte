<script lang="ts">
    import { ipcRenderer, type DesktopCapturerSource } from "electron";
    import Recorder from "./pages/Recorder.svelte";
    import Screens from "./pages/Screens.svelte";

    export let window_name;

    enum Windows {
        MAIN = 'main',
        SCREENS = 'screens'
    }

    let sourceId: string;
    let sourceIndex: string;

    async function getSources(): Promise<DesktopCapturerSource[]> {
        return await ipcRenderer.invoke('getSources')
            .then(response => {
                sourceId = response[0].id;
                sourceIndex = '1';
                return response;
            });
    }

    ipcRenderer.on('source-updated', (_event, newSourceId: number) => sourceId = newSourceId.toString());
</script>

<main class="grid h-dvh w-dvw relative">
    {#await getSources()}
        <h1>loading</h1>
    {:then inputSources}
        {#if window_name === Windows.MAIN}
            <Recorder {sourceId} {inputSources} {sourceIndex} />
        {:else if window_name === Windows.SCREENS}
            <Screens {sourceId} {inputSources} />
        {/if}
    {/await}
</main>