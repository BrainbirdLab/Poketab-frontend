<script lang="ts">

    //compoments
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Form from "$lib/components/form.svelte";
    import Messages from "$lib/components/chatUI/chatComponents/messages.svelte";
    import { currentPage, joinedChat } from "$lib/store";
    
</script>

{#if $currentPage == "chat" && $joinedChat}
    <ChatInterface>
        <Messages slot="messages"/>
    </ChatInterface>
{:else}
    <Form />
{/if}