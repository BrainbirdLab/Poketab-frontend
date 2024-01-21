<script lang="ts">
    import { FileMessageObj, MessageObj, StickerMessageObj, TextMessageObj, messageDatabase } from "$lib/messageTypes";
    import { chatRoomStore, myId } from "$lib/store";
    import { getTextData } from "$lib/components/chatUI/chatComponents/messages/messageUtils";

    export let replyTo: string;
    export let sender: string;
    export let classList: string;

    $: replyMessage = $messageDatabase.get(replyTo) as MessageObj;

    function getTitle() {
        let title = "";

        if (replyTo && $messageDatabase.has(replyTo)) {
            if (sender == $myId) {
                const repliedTo = $messageDatabase.get(replyTo) as MessageObj;
                title = `You replied to ${
                    repliedTo.sender == $myId
                        ? "yourself"
                        : $chatRoomStore.userList[repliedTo.sender]?.name
                }`;
            } else {
                const repliedTo = $messageDatabase.get(replyTo) as MessageObj;
                title = `${
                    $chatRoomStore.userList[sender]?.name
                } replied to ${
                    repliedTo.sender == $myId
                        ? "you"
                        : $chatRoomStore.userList[repliedTo.sender]?.name
                }`;
            }
        } else {
            if (sender == $myId) {
                title = "You";
            } else {
                title = $chatRoomStore.userList[sender]?.name;
            }
        }

        return title;
    }


</script>

{#if classList.includes("title")}
    <div class="messageTitle">
        {#if replyTo}
            <i class="fa-solid fa-reply"></i>
        {/if}
        {getTitle()}
    </div>
{/if}
{#if replyTo}
    <div class="messageReply {replyMessage.baseType}">
        {#if replyMessage instanceof TextMessageObj}
            {getTextData(replyMessage.message)}
        {:else if replyMessage instanceof FileMessageObj}    
            {getTextData(replyMessage.name)}
        {:else if replyMessage instanceof StickerMessageObj}
            <img src={replyMessage.src} class="sticker" alt="Sticker" />
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
        padding: 8px 8px 25px 8px;

        &.text::before{
            content: "\f10d";
            font-family: "Font Awesome 6 Free";
            font-weight: 900;
            font-size: 1rem;
            padding-right: 3px;
        }

        &:not(.text)::before{
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
            padding: 0 !important;
            background: hsl(0deg 0% 100% / 15%);
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
