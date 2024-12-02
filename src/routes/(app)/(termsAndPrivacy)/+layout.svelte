<script>
    import "./styles.scss";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";

    let { children } = $props();

    let ready = $state(false);
    onMount(() => {
        ready = true;
    })

</script>
{#if ready}
<div class="container-tos">
    <div class="topbar">
        <a class="name" href="/">Poketab Messenger</a>
    </div>
    <div class="content" in:fly={{y: 20}}>
        {@render children?.()}
    </div>
</div>
{/if}