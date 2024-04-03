<script lang="ts">

    //compoments
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Form from "$lib/components/form.svelte";
    import { currentPage, joinedChat } from "$lib/store";
    import { onMount } from "svelte";

    let mounted = false;

    onMount(() => {

        mounted = true;

        console.log("Mounted root +page.svelte");
    });
    
</script>

{#if mounted}
<div class="chat-content">
    {#if $currentPage == "chat" && $joinedChat}
        <ChatInterface />
    {:else}
        <Form />
    {/if}
</div>
{/if}


<style>
    .chat-content{
        display: flex;
        flex-direction: column;
        justify-content: safe center;
        align-items: center;
        height: 100%;
        width: 100%;
        gap: 20px;
        inset: 0;
        overflow: scroll;
    }
</style>