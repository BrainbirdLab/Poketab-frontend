<script lang="ts">
    import type { TextMessageObj } from "$lib/messageTypes";
    import Reacts from "./messageMetaComponents/reactsGroup.svelte";
    import MessageTop from "./messageMetaComponents/messageTop.svelte";
    import SeenBy from "./messageMetaComponents/seenBy.svelte";
    import MessageMeta from "./messageMetaComponents/dpAndSentIcon.svelte";
    import { messageContainer, messageScrolledPx } from "$lib/store";

    export let message: TextMessageObj;

</script>

<li class="message msg-item {message.classList}" id="{message.id}">
    <SeenBy seenBy={message.seenBy} id={message.id} />
    <div class="messageContainer" >
        <MessageMeta senderId={message.sender} isSent={message.sent}/>
        <div class="messageBody">
            <MessageTop senderId={message.sender} replyTo={message.replyTo} classList={message.classList}/>
            <div class="msg" data-mtype="{message.type}">
                <div class="data">{@html message.message}</div>
                {#if message.linkPreviewData}
                <div class="linkMetadata">
                    {#if message.linkPreviewData.image}
                    <div class="linkMetadata__image">
                        <img src={message.linkPreviewData.image} alt="{message.linkPreviewData.title}" on:load|once={()=> {
                            if ($messageScrolledPx < 20) {
                                $messageContainer.scrollTop = $messageContainer.scrollHeight;
                            }
                        }}/>
                    </div>
                    {/if}
                    <div class="linkMetadata__details">
                        {#if message.linkPreviewData.title}
                        <div class="linkMetadata__title">{@html message.linkPreviewData.title}</div>
                        {/if}
                        {#if message.linkPreviewData.description}
                        <div class="linkMetadata__description">{@html message.linkPreviewData.description}</div>
                        {/if}
                        {#if message.linkPreviewData.url}
                        <div class="linkMetadata__url">{message.linkPreviewData.url}</div>
                        {/if}
                    </div>
                </div>
                {/if}
            </div>
            <Reacts reactedBy={message.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .self {
        .linkMetadata .linkMetadata__details{
            border-left: 2px solid var(--msg-send);
            border-right: 2px solid var(--msg-send);
            border-bottom: 2px solid var(--msg-send);
        }
        .linkMetadata__url{
            color: var(--msg-send);
        }
    }

    .linkMetadata{
        width: 100%;
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
        text-decoration: none;
        .linkMetadata__details{
            border-left: 2px solid var(--msg-get);
            border-right: 2px solid var(--msg-get);
            border-bottom: 2px solid var(--msg-get);
        }
    }

    .linkMetadata__title{
        font-size: 0.7rem;
        text-align: left;
        word-break: break-all;
    }

    .linkMetadata__description{
        color: var(--transparent-white-color);
        font-size: 0.6rem;
        text-align: left;
    }

    .linkMetadata__details{
        height: min-content;
        width: 100%;
        background: #111d2a;
        padding: 10px;
        display: flex;
        text-align: left;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .linkMetadata__image{
        height: min-content;
        padding: 0;
        max-height: 200px;
        margin: 0;
        display: flex;
        background: aliceblue;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        img{
            object-fit: contain;
            background: none;
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            display: block;
            color: var(--shadow-color);
        }
    }

    .linkMetadata__url{
        color: var(--msg-get);
    }
</style>