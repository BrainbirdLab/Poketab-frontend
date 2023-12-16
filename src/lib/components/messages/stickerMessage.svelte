<script lang="ts">
    import type { StickerMessageObj } from "$lib/messages";
    import Reacts from "./messageComponents/reacts.svelte";
    import MessageTop from "./messageComponents/messageTop.svelte";
    import SeenBy from "./messageComponents/seenBy.svelte";
    import MessageMeta from "./messageComponents/messageMeta.svelte";

    export let message: StickerMessageObj
    export let id: string;

</script>

<li class="message msg-item {message.classList}" id="{id}"> <!-- noreply notitle delevered start end self react -->
    <SeenBy seenBy={message.seenBy} messageId={id} />
    <div class="messageContainer">
        <MessageMeta sender={message.sender} sent={message.sent}/>
        <div class="messageBody">
            <MessageTop sender={message.sender} classList={message.classList} replyTo={message.replyTo}/>
            <div class="messageMain">
                <div class="msg" data-mtype="sticker">
                    <img src="{message.src}" alt="{message.src}" data-sticker="{message.groupName}" class="data"/>
                </div>
                <div class="messageTime">Just Now</div>
            </div>
            <Reacts reactedBy={message.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .msg{
        height: 100px;
        width: 100px;
        background: #ffffff20;

        img{
            height: 100%;
            width: 100%;
            display: block;
        }
    }

</style>