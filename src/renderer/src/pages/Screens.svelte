<script lang="ts">
    import { ipcRenderer, type DesktopCapturerSource } from "electron";

    export let inputSources: DesktopCapturerSource[];
    export let sourceId: string;

    let selectedScreen = inputSources.find(source => source.id === sourceId) ?? inputSources[0];

    function closeWindow() {
        ipcRenderer.invoke('secondaryWindow', 'close');
    }


    function selectScreen(e: Event) {
        const { checked, value: index } = e.target as HTMLInputElement;

        if (checked) {
            selectedScreen = inputSources[+index];
        }
    }
</script>

<section class="w-full h-[100vh] grid grid-cols-[200px,1fr] divide-x border border-gray-900 [&>*]:border-gray-900">
    <aside class="bg-gray-800 h-full flex flex-col justify-between shadow-inner">
        <ul>
            {#each inputSources as source, index}
                <li class="cursor-pointer has-[input:checked]:bg-gray-700">
                    <label class="text-zinc-200 h-full p-3 w-full block">
                        <input
                            hidden
                            type="radio"
                            checked={selectedScreen === inputSources[index]}
                            name="screen"
                            value={index}
                            on:change={selectScreen}
                        />
                        {source.name}
                    </label>
                </li>
            {/each}
        </ul>
        <button class="text-zinc-200 py-2" on:click={closeWindow}>
            Ok
        </button>
    </aside>
    <div class="p-1 bg-gray-800 h-full grid content-center">
        {#if inputSources?.length}
            <img
                class="select-none w-full h-auto shadow-xl shadow-zinc-900"
                src={(selectedScreen ?? inputSources[0]).thumbnail.toDataURL()}
                alt={(selectedScreen ?? inputSources[0]).name}
            />
        {/if}
    </div>
</section>