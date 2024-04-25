<script lang="ts">
    import { FileMessageObj, ImageMessageObj, MessageObj, StickerMessageObj, TextMessageObj, messageDatabase } from "$lib/messageTypes";
    import { chatRoomStore, myId } from "$lib/store";
    import { getTextData } from "$lib/components/chatUI/chatComponents/messages/messageUtils";

    export let replyTo: string;
    export let senderId: string;
    export let classList: string;

    $: index = messageDatabase.getIndex(replyTo);

    $: replyMessage = $messageDatabase[index] as MessageObj;

    $: title = replyTo ? (`${senderId === $myId ? "You" : $chatRoomStore.userList[senderId]?.avatar || 'A Zombie'} replied to ${replyMessage?.sender === senderId ? "self" : $chatRoomStore.userList[replyMessage?.sender]?.avatar || 'a Zombie'}`) 
                : (senderId === $myId ? 'You' : $chatRoomStore.userList[senderId]?.avatar || 'A Zombie');

</script>

{#if classList.includes("title")}
    <div class="messageTitle">
        {#if replyTo}
            <i class="fa-solid fa-reply"></i>
        {/if}
        {title}
    </div>
{/if}
{#if replyTo}
    <div class="messageReply {replyMessage?.baseType || "text"}">
        {#if replyMessage}
            {#if replyMessage instanceof TextMessageObj}
                {getTextData(replyMessage.message)}
            {:else if replyMessage instanceof ImageMessageObj}
                <img src={replyMessage.url} class="image" alt="{replyMessage.name}" />
            {:else if replyMessage instanceof FileMessageObj}    
                {getTextData(replyMessage.name)}
            {:else if replyMessage instanceof StickerMessageObj}
                <img src={replyMessage.src} class="sticker" alt="Sticker" />
            {/if}
        {:else}
            Zombie message
        {/if}
    </div>
{/if}

<style lang="scss">
    .messageTitle {
        color: var(--secondary-dark);
        padding: 3px;
        display: flex;
        flex-direction: row;
        align-items: baseline;
        gap: 5px;
        margin-top: 15px;
    }

    .messageReply {
        background: var(--msg-get-reply);
        color: hsla(0, 0%, 100%, 0.5);
        border-radius: 18px 18px 18px 8px;
        width: max-content;
        max-width: 250px;
        white-space: pre;
        overflow: hidden;
        display: inline-block;
        text-overflow: ellipsis;
        cursor: pointer;
        z-index: 0;

        &:not(.image, .sticker){
            padding: 8px 8px 15px 8px;
        }

        &.text::before{
            content: "\f10d";
            font-family: "Font Awesome 6 Free";
            font-weight: 900;
            font-size: 1rem;
            padding-right: 3px;
        }

        &:not(.text, .sticker, .image)::before{
            content: "\f0c6";
            font-family: "Font Awesome 6 Free";
            font-weight: 900;
            font-size: 1rem;
            padding-right: 3px;
        }

        > * {
            pointer-events: none;
        }

        &.sticker {
            background: hsl(0deg 0% 100% / 15%);
        }

        &.image{
            filter: brightness(0.5);
        }

        img {
            height: 100%;
            width: 100%;
            border-radius: 10px;
            display: block;

            &.sticker {
                height: 100px;
                width: 100px;
                background: none;
                filter: brightness(0.5);
            }
        }
    }
</style>
