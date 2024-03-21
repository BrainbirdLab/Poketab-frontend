<script lang="ts">
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Form from "$lib/components/form.svelte";
    import { currentPage, joinedChat, currentTheme } from "$lib/store";
    import { onMount } from "svelte";

    let mounted = false;

    onMount(() => {

        mounted = true;

        console.log("Mounted root +page.svelte");
    });
    
</script>

<svelte:head>
    <link rel="stylesheet" href="/themes/{$currentTheme}.css">
</svelte:head>

{#if mounted}
<div class="content">
    {#if $currentPage == "chat" && $joinedChat}
        <ChatInterface />
    {:else}
        <Form />
    {/if}
</div>
{/if}


<style>
    .content{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        inset: 0;
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>