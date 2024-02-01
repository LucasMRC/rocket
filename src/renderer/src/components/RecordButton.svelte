<script lang="ts">
    export let start: () => void;
    export let stop: () => void;
    export let disabled: boolean;
    export let recording: boolean;
</script>

<button class="border-2 border-slate-900 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 w-12 h-12 absolute left-0 bg-gray-950 shadow-lg grid rounded-full place-items-center cursor-pointer" on:click={!recording ? start : stop} {disabled}>
    <div class="absolute z-0 w-1/3 h-1/3 bg-red-950 rounded-full"></div>
    {#if recording}
        <div class="absolute z-10 w-1/3 h-1/3 bg-red-400 rounded-full animate-record"></div>
    {/if}
</button>
