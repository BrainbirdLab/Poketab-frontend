<script lang="ts">
    import { MessageObj, messageDatabase } from "$lib/messages";
    import { chatRoomStore, selfInfoStore } from "$lib/store";

    export let message: MessageObj;
</script>

{#if message.classList.includes('title')}
<div class="messageTitle">
    {#if message.replyTo && message.replyTo in $messageDatabase}
        {#if message.sender == $selfInfoStore.uid}
        You replied to {$chatRoomStore.userList[Object.setPrototypeOf($messageDatabase.get(message.replyTo), MessageObj.prototype)?.sender || ''].name}
        {:else}
        {$chatRoomStore.userList[message.sender]?.name} replied to {$chatRoomStore.userList[Object.setPrototypeOf($messageDatabase.get(message.replyTo), MessageObj.prototype)?.sender || ''].uid == $selfInfoStore.uid ? ' you' : $chatRoomStore.userList[Object.setPrototypeOf($messageDatabase.get(message.replyTo), MessageObj.prototype) || ''].name}
        {/if}
    {:else}
        {#if message.sender == $selfInfoStore.uid}
        You
        {:else}
        {$chatRoomStore.userList[message.sender]?.name}
        {/if}
    {/if}
</div>
{/if}
{#if message instanceof MessageObj && message.replyTo}
<div class="messageReply">
    {Object.setPrototypeOf($messageDatabase.get(message.replyTo), MessageObj.prototype)?.message}
</div>
{/if}