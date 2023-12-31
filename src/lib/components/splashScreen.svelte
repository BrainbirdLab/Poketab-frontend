<script>
    import { splashMessage } from "$lib/store";
    import { onMount } from "svelte";

    let mounted = false;

    onMount(() => {
        mounted = true;
    });
</script>

{#if mounted && $splashMessage}    
    <div class="container">
        <div class="text">{$splashMessage}</div>
        <i class="fa-solid fa-circle-notch fa-spin"></i>
    </div>
{/if}

<style lang="scss">
    .container {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        color: var(--secondary-dark);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--primary-dark);
        z-index: 1000;
    }
</style>