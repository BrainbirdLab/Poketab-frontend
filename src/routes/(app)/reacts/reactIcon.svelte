<script lang="ts">
    import { onMount } from "svelte";
    import { type TransitionConfig } from "svelte/transition";
    export let react: string;
    export let users: string[] = [];

    function halfQuadOut(t: number) {
        return -t * (t - 1.0);
    }

    function popup(node: Element, options: {
        delay: number,
        duration: number,
        scale: number,
    } = {
        delay: 0,
        duration: 300,
        scale: 1.5,
    }): TransitionConfig {
        
        return {
        delay: options.delay,
        duration: options.duration,
        css: (t, u) => {
        const translateY = t < 0.5 ? -15 * t : -15 * (1 - t);
        const scale = t < 0.5 ? 1 + options.scale * t : 1 + options.scale * (1 - t);
        return `
            transform: scale(${scale}) translateY(${translateY}px);
            z-index: 10;
            `;
        },
        easing: halfQuadOut,
        };
  }

    onMount(() => {
        console.log(react + " reactIcon mounted");
    })

</script>

<div class="react-group">
    {#each users as user (user)}
    {#key user}
    <div class="react-container" in:popup|global={{delay: 0, duration: 500, scale: 1.6}}>
        {react}
    </div>
    {/key}
    {/each}
</div>

<style lang="scss">

    .react-group {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        position: relative;
        height: 18px;
        aspect-ratio: 1/1;

        .react-container {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
</style>