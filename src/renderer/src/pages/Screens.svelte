<script lang="ts">
import { ipcRenderer, type DesktopCapturerSource } from "electron";

export let inputSources: DesktopCapturerSource[];
export let sourceId: string;

$: selectedScreen = inputSources.find(source => source.id === sourceId) ?? inputSources[0];

function closeWindow() {
	ipcRenderer.invoke('SECONDARY_WINDOW', { action: 'close', sourceId: selectedScreen.id, screen: 'screens' });
}

function selectScreen(e: Event) {
	const { checked, value: index } = e.target as HTMLInputElement;

	if (checked) {
		selectedScreen = inputSources[+index];
	}
}
</script>

<section class="w-full h-[100vh] grid grid-cols-[200px,1fr] border-2 border-slate-400 divide-x-2 divide-slate-400">
	<aside class="bg-slate-900 h-full flex flex-col justify-between divide-slate-400 divide-y">
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
	<div class="bg-slate-700 p-2 grid place-content-center overflow-y-hidden">
		{#if inputSources?.length}
			<img
				class="select-none shadow-xl shadow-slate-900 max-h-[90vh]"
				src={(selectedScreen ?? inputSources[0]).thumbnail.toDataURL()}
				alt={(selectedScreen ?? inputSources[0]).name}
			/>
		{/if}
	</div>
</section>
