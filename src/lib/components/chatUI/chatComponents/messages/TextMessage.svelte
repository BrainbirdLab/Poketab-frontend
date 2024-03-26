<script lang="ts">
    import type { TextMessageObj } from "$lib/messageTypes";
    import Reacts from "./messageMetaComponents/reactsGroup.svelte";
    import MessageTop from "./messageMetaComponents/messageTop.svelte";
    import SeenBy from "./messageMetaComponents/seenBy.svelte";
    import MessageMeta from "./messageMetaComponents/dpAndSentIcon.svelte";

    export let message: TextMessageObj;

</script>

<li class="message msg-item {message.classList}" id="{message.id}">
    <SeenBy seenBy={message.seenBy} id={message.id} />
    <div class="messageContainer" >
        <MessageMeta senderId={message.sender} isSent={message.sent}/>
        <div class="messageBody">
            <MessageTop senderId={message.sender} replyTo={message.replyTo} classList={message.classList}/>
            <div class="messageMain">
                <div class="msg" data-mtype="{message.type}">
                    <div class="data">{@html message.message}</div>
                    {#if message.linkPreviewData}
                    <div class="linkMetadata">
                        {#if message.linkPreviewData.image}
                        <div class="linkMetadata__image">
                            <img src="{message.linkPreviewData.image}" alt="{message.linkPreviewData.title}" />
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
                <div class="messageTime">Just now</div>
            </div>
            <Reacts reactedBy={message.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .linkMetadata{
        width: 100%;
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
        text-decoration: none;
    }

    .linkMetadata__title{
        font-size: 1rem;
    }

    .linkMetadata__description{
        color: grey;
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
        }
    }

    .linkMetadata__url{
        color: #b6b6b6;
    }


</style>