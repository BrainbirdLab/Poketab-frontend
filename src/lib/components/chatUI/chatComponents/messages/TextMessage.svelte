<script lang="ts">

    import type { TextMessageObj } from "$lib/messageStore.svelte";
    import Reacts from "./messageMetaComponents/reactsGroup.svelte";
    import MessageTop from "./messageMetaComponents/messageTop.svelte";
    import SeenBy from "./messageMetaComponents/seenBy.svelte";
    import MessageMeta from "./messageMetaComponents/dpAndSentIcon.svelte";
    import { messageContainer, messageScrolledPx } from "$lib/store.svelte";

    interface Props {
        message: TextMessageObj;
    }

    let { message }: Props = $props();

    function once(fn: () => void) {
        let called = false;
        return function () {
            if (!called) {
                called = true;
                fn();
            }
        };
    }

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
                    <div class="linkMetadataImage">
                        <img src={message.linkPreviewData.image} alt="{message.linkPreviewData.title}" 
                            onload={once(()=> {
                                if (messageScrolledPx.value < 20) {
                                    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
                                }
                            })}
                        />
                    </div>
                    {/if}
                    <div class="linkMetadataDetails">
                        {#if message.linkPreviewData.title}
                        <div class="linkMetadataTitle">{@html message.linkPreviewData.title}</div>
                        {/if}
                        {#if message.linkPreviewData.description}
                        <div class="linkMetadataDescription">{@html message.linkPreviewData.description}</div>
                        {/if}
                        {#if message.linkPreviewData.url}
                        <div class="linkMetadataUrl">{message.linkPreviewData.url}</div>
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

    .linkMetadata{
        width: 100%;
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
        text-decoration: none;
        .linkMetadataDetails{
            border-left: 2px solid var(--message-color);
            border-right: 2px solid var(--message-color);
            border-bottom: 2px solid var(--message-color);
        }
    }

    .linkMetadataUrl{
        color: var(--message-color);
        font-size: 0.7rem;
    }

    .linkMetadataTitle{
        font-size: 0.7rem;
        text-align: left;
        word-break: break-all;
    }

    .linkMetadataDescription{
        color: var(--transparent-white-color);
        font-size: 0.6rem;
        text-align: left;
    }

    .linkMetadataDetails{
        height: min-content;
        width: 100%;
        background: #252628;
        padding: 10px;
        display: flex;
        text-align: left;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
    }

    .linkMetadataImage{
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
            background: #252628;
            margin: 0;
            padding: 0;
            height: 100%;
            width: 100%;
            min-width: 300px;
            display: block;
            color: var(--text-color);
        }
    }

</style>