<script lang="ts">
    import { FileMessageObj, ImageMessageObj, MessageObj, StickerMessageObj, TextMessageObj, messageDatabase } from "$lib/messageStore.svelte";
    import { chatRoomStore, myId } from "$lib/store.svelte";
    import { getTextData } from "$lib/components/chatUI/chatComponents/messages/messageUtils";

    interface Props {
        replyTo: string;
        senderId: string;
        classList: string;
    }

    let { replyTo, senderId, classList }: Props = $props();

    let replyMessage = $derived(messageDatabase.getMessage(replyTo) as MessageObj);

    let title = $derived(replyTo ? (`${senderId === myId.value ? "You" : chatRoomStore.value.userList[senderId]?.avatar || 'A Zombie'} replied to ${replyMessage?.sender === senderId ? "self" : chatRoomStore.value.userList[replyMessage?.sender]?.avatar || 'a Zombie'}`) 
                : (senderId === myId.value ? 'You' : chatRoomStore.value.userList[senderId]?.avatar || 'A Zombie'));

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
