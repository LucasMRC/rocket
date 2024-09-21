<script lang="ts">
import { ipcRenderer, type DesktopCapturerSource } from "electron";
import log from 'electron-log/renderer';

export let config: Config;
export let inputSources: DesktopCapturerSource[];
export let sourceId: string;

$: selectedScreen = inputSources.find(source => source.id === sourceId) ?? inputSources[0];
$: configValues = JSON.parse(JSON.stringify(config ?? { format: 'mp4', savePath: '' }));

function closeWindow() {
	ipcRenderer.invoke('SECONDARY_WINDOW', { action: 'close', config: configValues, sourceId: selectedScreen.id, screen: 'settings' });
}

function selectScreen(e: Event) {
	const { checked, value: index } = e.target as HTMLInputElement;

	if (checked) {
		log.info('Selected screen:', inputSources[+index]);
		selectedScreen = inputSources[+index];
	}
}

async function handleOpenPathDialog() {
	log.info('Opening dialog to change save directory');
	const { canceled, filePaths } = await ipcRenderer.invoke('SHOW_DIALOG', { action: 'change_save_path' });
	if (!canceled) {
		configValues.savePath = filePaths[0];
	}
}

function selectFormat(e: Event) {
	const { value } = e.target as HTMLSelectElement;
	configValues.format = value;
}

</script>

<section class="w-full h-[100vh] grid grid-cols-[200px,1fr] grid-rows-[64px,1fr] border-2 border-slate-400">
	<div class="flex row-start-1 row-end-1 col-span-2 justify-around bg-slate-900 items-center border-b-slate-400 border-b-2">
		<div class="flex items-center">
			<label for="format" class="text-zinc-200 text-xs p-2">Format</label>
			<select on:change={selectFormat} class="text-xs h-5 rounded" name="format" id="format">
				<option value="mp4" class="text-xs h-5" selected={configValues.format === 'mp4'}>MP4</option>
				<!-- <option value="webm" class="text-xs h-5" selected={configValues.format === 'webm'}>WEBM</option> -->
			</select>
		</div>
		<div class="flex items-center">
			<label for="path" class="text-zinc-200 p-2 text-xs">Save directory</label>
			<input type="text" id="path" class="rounded h-5 text-xs w-60 px-2" bind:value={configValues.savePath} />
			<button on:click={handleOpenPathDialog} class="text-zinc-200 bg-zinc-700 hover:brightness-125 text-xs px-2 py-1 transition-all border-1 ml-1 border-slate-200 rounded">Change</button>
		</div>
	</div>
	<aside class="bg-slate-900 row-start-2 h-full flex flex-col justify-between divide-slate-400 divide-y border-r-slate-400 border-r-2">
		<ul class="max-h-[15.875rem] shadow-inner shadow-slate-950 overflow-y-auto">
			{#each inputSources as source, index}
				<li class="has-[input:checked]:bg-gray-700 border-b border-slate-400 border-dotted">
					<label class="[&:not(:has(input:checked))]:cursor-pointer text-zinc-200 h-full p-2 text-xs w-full block">
						<input
							id={source.id}
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
		<button class="text-zinc-200 py-2 bg-slate-900 cursor-pointer hover:brightness-125" on:click={closeWindow}>
			Ok
		</button>
	</aside>
	<div class="bg-slate-700 p-2 grid row-start-2 place-content-center overflow-y-hidden">
		{#if inputSources?.length}
			<img
				class="select-none shadow-xl shadow-slate-900 max-h-[90vh]"
				src={(selectedScreen ?? inputSources[0]).thumbnail.toDataURL()}
				alt={(selectedScreen ?? inputSources[0]).name}
			/>
		{/if}
	</div>
</section>
