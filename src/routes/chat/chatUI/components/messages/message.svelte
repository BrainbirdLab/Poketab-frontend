<script lang="ts">
    import type { MessageObj } from "$lib/messages";
    import Reacts from "./messageComponents/reacts.svelte";
    import MessageTop from "./messageComponents/messageTop.svelte";
    import SeenBy from "./messageComponents/seenBy.svelte";
    import MessageMeta from "./messageComponents/messageMeta.svelte";
    import { getFormattedDate } from "./messageUtils";

    export let message: MessageObj;
    export let id: string;

</script>

<li class="message msg-item {message.classList}" id="{id}">
    <SeenBy seenBy={message.seenBy} messageId={id} />
    <div class="messageContainer" >
        <MessageMeta sender={message.sender} sent={message.sent}/>
        <div class="messageBody">
            <MessageTop sender={message.sender} classList={message.classList} replyTo={message.replyTo}/>
            <div class="messageMain">
                <div class="msg" data-mtype="{message.type}">
                    <div class="data">{message.message}</div>
                </div>
                <div class="messageTime">{getFormattedDate(message.timeStamp)}</div>
            </div>
            <Reacts reactedBy={message.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .msg{
        &[data-mtype="text"]{
            padding: 8px;
        }
        &[data-mtype="emoji"]{
            font-size: 2rem;
        }
    }

</style>