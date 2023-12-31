<script lang="ts">
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Form from "$lib/components/form.svelte";
    import { currentPage, joinedChat } from "$lib/store";

    console.log('root +page.svelte');
    
</script>

<div class="content">
    {#if $currentPage == "chat" && $joinedChat}
        <ChatInterface />
    {:else}
        <Form />
    {/if}
</div>


<style>
    .content{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        background: rgba(0, 0, 0, 0.6117647059) var(--pattern);
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>