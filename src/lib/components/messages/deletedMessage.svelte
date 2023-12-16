<script lang="ts">
    import type { TextMessageObj } from "$lib/messages";
    import MessageTop from "./messageComponents/messageTop.svelte";
    import SeenBy from "./messageComponents/seenBy.svelte";
    import MessageMeta from "./messageComponents/messageMeta.svelte";

    export let message: TextMessageObj;
    export let id: string;

</script>

<li class="message msg-item {message.classList}" id="{id}">
    <SeenBy seenBy={message.seenBy} messageId={id} />
    <div class="messageContainer" >
        <MessageMeta sender={message.sender} sent={message.sent}/>
        <div class="messageBody">
            <MessageTop sender={message.sender} classList={message.classList} replyTo=""/>
            <div class="messageMain">
                <div class="msg" data-mtype="deleted">
                    <div class="data">This message was deleted</div>
                </div>
                <div class="messageTime">Just Now</div>
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