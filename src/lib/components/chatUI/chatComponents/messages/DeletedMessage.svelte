<script lang="ts">
    import type { TextMessageObj } from "$lib/messageTypes";
    import MessageTop from "./messageMetaComponents/messageTop.svelte";
    import SeenBy from "./messageMetaComponents/seenBy.svelte";
    import MessageMeta from "./messageMetaComponents/dpAndSentIcon.svelte";

    interface Props {
        message: TextMessageObj;
    }

    let { message }: Props = $props();

</script>

<li class="message msg-item {message.classList}" id="{message.id}">
    <SeenBy seenBy={message.seenBy} id={message.id} />
    <div class="messageContainer" >
        <MessageMeta senderId={message.sender} isSent={message.sent}/>
        <div class="messageBody">
            <MessageTop senderId={message.sender} classList={message.classList} replyTo=""/>
            <div class="msg" data-mtype="deleted">
                <div class="data">This message was deleted</div>
            </div>
        </div>
    </div>
</li>

<style lang="scss">

    .msg[data-mtype="deleted"]{
        padding: 8px;
        background: #ffffff30;
        color: #ffffffa0;

        &:hover{
            cursor: not-allowed;
        }
    }

</style>