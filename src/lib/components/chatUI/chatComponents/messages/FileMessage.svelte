<script lang="ts">
    import { getSize } from "./messageUtils";
    import { ImageMessageObj, type FileMessageObj, messageScrolledPx } from "$lib/messageTypes";
    import Reacts from "./messageComponents/reacts.svelte";
    import MessageTop from "./messageComponents/messageTop.svelte";
    import SeenBy from "./messageComponents/seenBy.svelte";
    import MessageMeta from "./messageComponents/messageMeta.svelte";
    import { getIcon } from "$lib/utils";
    import { myId, showScrollPopUp } from "$lib/store";

    export let file: FileMessageObj;
    export let id: string;

</script>

<li class="message msg-item {file.classList}" id="{id}"> <!-- noreply notitle delevered start end self react -->
    <SeenBy seenBy={file.seenBy} messageId={id} />
    <div class="messageContainer">
        <MessageMeta sender={file.sender} sent={file.sent}/>
        <div class="messageBody">
            <MessageTop sender={file.sender} classList={file.classList} replyTo={file.replyTo}/>
            <div class="messageMain">
                <div class="msg" data-mtype="{file.baseType}">
                    <div class="data">
                        {#if !(file instanceof ImageMessageObj)}
                        <!--
                            {#if file.type.includes('image')}
                                <i class="icon fa-solid fa-file-image"></i>
                            {:else if file.type.includes('video')}
                                <i class="icon fa-solid fa-file-video"></i>
                            {:else if file.type.includes('audio')}
                                <i class="icon fa-solid fa-file-audio"></i>
                            {:else}
                                <i class="icon fa-solid fa-file-lines"></i>
                            {/if}
                        -->
                            <i class="icon fa-solid {getIcon(file.type)}"></i>
                            <div class="fileInfo">
                                <div class="fileName">{file.name}</div>
                                <div class="fileMeta">
                                    <div class="ext">
                                        {file.name.split('.').pop() || 'Document'}
                                    </div>
                                    <div class="progress"></div>
                                    <div class="fileSize">{getSize(file.size)}</div>
                                </div>
                            </div>
                        {:else}
                            <img src="{file.url}" alt="{file.name}" height="{file.height}" width="{file.width}" style={ file.loaded || file.sender === $myId ? "" : "filter: blur(10px); transform: scale(1.1); transition: 500ms ease-in-out;"}>
                        {/if}
                    </div>
                </div>
                <div class="messageTime">Just now</div>
            </div>
            <Reacts reactedBy={file.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .data{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;

        &:not(:has(img)){
            padding: 5px 10px;
        }

        img {
            max-width: 100%;
            max-height: 100%;
            height: auto;
            object-fit: contain;
        }

        .icon{
            font-size: 23px;
            color: #ffffffae;
            padding-left: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .fileInfo{
            display: flex;
            flex-direction: column;
            overflow: hidden;
            gap: 2px;
            padding: 0 5px;
            font-size: 0.8rem;
            white-space: nowrap;

            .fileName{
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
            }
        }
    }

    .fileMeta{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        font-size: 0.6rem;
    }

</style>