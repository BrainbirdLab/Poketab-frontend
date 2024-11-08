<script lang="ts">
    import { getSize } from "./messageUtils";
    import {
        ImageMessageObj,
        type FileMessageObj,
    } from "$lib/messageTypes";
    import Reacts from "./messageMetaComponents/reactsGroup.svelte";
    import MessageTop from "./messageMetaComponents/messageTop.svelte";
    import SeenBy from "./messageMetaComponents/seenBy.svelte";
    import MessageMeta from "./messageMetaComponents/dpAndSentIcon.svelte";
    import { getIcon } from "$lib/utils";
    import { myId } from "$lib/store.svelte";
    import ImageMessage from "./ImageMessage.svelte";

    interface Props {
        file: FileMessageObj;
    }

    let { file }: Props = $props();
</script>

<li class="message msg-item {file.classList}" id={file.id}>
    <!-- noreply notitle delevered start end self react -->
    <SeenBy seenBy={file.seenBy} id={file.id} />
    <div class="messageContainer">
        <MessageMeta senderId={file.sender} isSent={file.sent} />
        <div class="messageBody">
            <MessageTop
                senderId={file.sender}
                classList={file.classList}
                replyTo={file.replyTo}
            />
            <div class="msg" data-mtype={file.baseType}>
                <div class="data">
                    {#if !(file instanceof ImageMessageObj)}
                        <i class="icon fa-solid {getIcon(file.type)}"></i>
                        <div class="fileInfo">
                            <div class="fileName">{file.name}</div>
                            <div class="fileMeta">
                                <div class="ext">
                                    {file.name.split(".").pop() ||
                                        "Document"}
                                </div>
                                {#if file.loaded < 100}
                                    <div class="progress">
                                        {#if file.loadScheme == "upload"}
                                            <i class="fa-solid fa-arrow-up"
                                            ></i>
                                            {file.sender === $myId
                                                ? `${file.loaded}%`
                                                : "Sending"}
                                        {:else if file.loadScheme == "download"}
                                            <i
                                                class="fa-solid fa-arrow-down"
                                            ></i>
                                            {file.loaded}%
                                        {/if}
                                    </div>
                                {/if}
                                <div class="fileSize">
                                    {getSize(file.size)}
                                </div>
                            </div>
                        </div>
                    {:else}
                        <ImageMessage file={file} />
                    {/if}
                </div>
            </div>
            <Reacts reactedBy={file.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .progress {
        white-space: break-spaces;
        text-align: center;
        min-width: 50px;
        font-size: 0.6rem !important;
        * {
            font-size: 0.6rem !important;
            color: inherit !important;
        }
    }

    .data {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        position: relative;

        &:not(:has(img)) {
            padding: 5px 10px 10px 5px;
        }

        .icon {
            font-size: 25px;
            color: var(--transparent-white-color);
            padding: 8px 0 5px 8px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .fileInfo {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            gap: 2px;
            padding: 0 5px;
            font-size: 0.8rem;
            white-space: nowrap;
            min-width: 125px;

            .fileName {
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
            }
        }
    }

    .fileMeta {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        font-size: 0.6rem;
        color: var(--transparent-white-color);
        * {
            color: inherit;
        }
    }
</style>
