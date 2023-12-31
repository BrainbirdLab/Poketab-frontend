<script lang="ts">
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Form from "$lib/components/form.svelte";
    import { currentPage, joinedChat } from "$lib/store";
    import { onMount } from "svelte";

    console.log('root +page.svelte');

    let mounted = false;

    onMount(() => {

        mounted = true;

        console.log("Mounted root +page.svelte");
    });
    
</script>

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
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>