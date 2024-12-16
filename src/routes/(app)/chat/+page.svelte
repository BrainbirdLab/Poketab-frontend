<script lang="ts">

    //compoments
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Form from "$lib/components//formUI/form.svelte";
    import { currentPage, joinedChat } from "$lib/store.svelte";
    
</script>

{#if currentPage.value == "chat" && joinedChat.value}
    <ChatInterface />
{:else}
    <Form />
{/if}