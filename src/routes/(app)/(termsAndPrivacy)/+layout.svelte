<script>
    import "./styles.scss";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";

    let ready = false;
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
        <slot></slot>
    </div>
</div>
{/if}