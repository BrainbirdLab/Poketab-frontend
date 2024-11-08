<script lang="ts">
    import type { StickerMessageObj } from "$lib/messageTypes";
    import Reacts from "./messageMetaComponents/reactsGroup.svelte";
    import MessageTop from "./messageMetaComponents/messageTop.svelte";
    import SeenBy from "./messageMetaComponents/seenBy.svelte";
    import MessageMeta from "./messageMetaComponents/dpAndSentIcon.svelte";

    interface Props {
        message: StickerMessageObj;
    }

    let { message }: Props = $props();

</script>

<li class="message msg-item {message.classList}" id="{message.id}"> <!-- noreply notitle delevered start end self react -->
    <SeenBy seenBy={message.seenBy} id={message.id} />
    <div class="messageContainer">
        <MessageMeta senderId={message.sender} isSent={message.sent}/>
        <div class="messageBody">
            <MessageTop senderId={message.sender} classList={message.classList} replyTo={message.replyTo}/>
            <div class="msg" data-mtype="sticker">
                <img src="{message.src}" alt="{message.src}" data-sticker="{message.groupName}" class="data"/>
            </div>
            <Reacts reactedBy={message.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .msg{
        height: 100px;
        width: 100px;
        background: hsl(0deg 0% 100% / 15%);

        img{
            height: 100%;
            width: 100%;
            display: block;
            pointer-events: none;
        }
    }

</style>