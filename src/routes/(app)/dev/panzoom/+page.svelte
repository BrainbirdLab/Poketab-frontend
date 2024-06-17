
<script lang="ts">
    import { onMount } from "svelte";
    import { PanZoom } from "$lib/panzoom";

    let image: HTMLImageElement;

    onMount(() => {
        PanZoom(image);
    });
</script>

<div class="panzoom">
    <img bind:this={image} src="https://picsum.photos/2000/2000" alt="Could not load" class="main-image"/>
</div>

<style lang="scss">
    .panzoom{
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .main-image{
        position: absolute;
        max-width: 100%;
        max-height: 100%;
    }
</style>