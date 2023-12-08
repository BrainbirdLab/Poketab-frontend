<script lang="ts">
    import type { MessageObj } from "$lib/messages";
    import { chatRoomStore, selfInfoStore } from "$lib/store";
    import Reacts from "./messageComponents/reacts.svelte";
    import MessageTop from "./messageComponents/messageTop.svelte";
    import SeenBy from "./messageComponents/seenBy.svelte";

    export let message: MessageObj;
    export let id: string;

    console.log(message.seenBy);

</script>

<li class="message msg-item {message.classList}" id="{id}"> <!-- noreply notitle delevered start end self react -->
    <SeenBy seenBy={message.seenBy} messageId={id} />
    <div class="messageContainer">
        <div class="replyIcon">
            <i class="fa-solid fa-reply"></i>
        </div>
        {#if !message.sent}
        <div class="sent"><i class="fa-regular fa-paper-plane"></i></div>
        {/if}
        {#if message.sender != $selfInfoStore.uid}
        <div class="avatar"><img src="/images/avatars/{($chatRoomStore.userList[message.sender]?.avatar)}(custom).webp" width="30px" height="30px" alt="avatar"></div>
        {/if}
        <div class="messageBody">
            <MessageTop message={message} />
            <div class="messageMain">
                <div class="msg {message.type}"><span class="{message.type}">{message.message}</span></div>
                <div class="messageTime">Just Now</div>
            </div>
            <Reacts reactedBy={message.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .msg{
        .text{
            padding: 8px;
        }
        .emoji{
            font-size: 2rem;
        }
    }

</style>