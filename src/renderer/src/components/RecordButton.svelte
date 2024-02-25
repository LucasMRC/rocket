<script lang="ts">
    export let start: () => void;
    export let stop: () => void;
    export let disabled: boolean;
    export let recording: boolean;
</script>

<div class="z-20 border border-slate-500 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 w-10 h-10 absolute left-0 bg-gray-950 shadow-lg grid rounded-full place-items-center">
    <button on:click={!recording ? start : stop} {disabled} class="cursor-pointer absolute z-0 w-[45%] h-[45%] bg-red-950 rounded-full border-2 border-red-900 disabled:filter disabled:grayscale disabled:brightness-200 disabled:cursor-default"></button>
    {#if recording}
        <div class="absolute pointer-events-none z-10 w-[45%] h-[45%] bg-red-400 rounded-full animate-record"></div>
    {/if}
</div>
