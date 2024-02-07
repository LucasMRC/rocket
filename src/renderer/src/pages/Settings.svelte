<script lang="ts" type="module">
    import { ipcRenderer } from 'electron';
    function closeWindow() {
        ipcRenderer.invoke('SECONDARY_WINDOW', { action: 'close', screen: 'settings' });
    }
</script>

<section class="bg-white h-[30px] my-auto ml-10 w-[100px] flex items-center select-none">
    <aside class="bg-slate-900 h-full flex flex-col justify-between divide-slate-400 divide-y">
        <ul class="max-h-[15.875rem] shadow-inner shadow-slate-950 overflow-y-auto">
                <li class="has-[input:checked]:bg-gray-700 border-b border-slate-400 border-dotted">
                    <label class="[&:not(:has(input:checked))]:cursor-pointer text-zinc-200 h-full p-2 text-xs w-full block">
                        <input
                            hidden
                            type="radio"
                            name="screen"
                        />
                        Display
                    </label>
                </li>
                <li class="has-[input:checked]:bg-gray-700 border-b border-slate-400 border-dotted">
                    <label class="[&:not(:has(input:checked))]:cursor-pointer text-zinc-200 h-full p-2 text-xs w-full block">
                        <input
                            hidden
                            type="radio"
                            name="screen"
                        />
                        Display
                    </label>
                </li>
        </ul>
        <button class="text-zinc-200 py-2 bg-slate-900 cursor-pointer hover:brightness-125" on:click={closeWindow}>
            Ok
        </button>
    </aside>
    <div class="bg-slate-700 p-2 grid place-content-center overflow-y-hidden">
    </div>
</section>
