<script lang="ts">
    import { getSize } from "./messageUtils";
    import {
        ImageMessageObj,
        type FileMessageObj,
    } from "$lib/messageStore.svelte";
    import Reacts from "./messageMetaComponents/reactsGroup.svelte";
    import MessageTop from "./messageMetaComponents/messageTop.svelte";
    import SeenBy from "./messageMetaComponents/seenBy.svelte";
    import MessageMeta from "./messageMetaComponents/dpAndSentIcon.svelte";
    import { getIcon } from "$lib/utils";
    import { myId } from "$lib/store.svelte";

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
                                            {file.sender === myId.value
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
                    <img
                        class="image"
                        src={file.url}
                        alt={file.name}
                        height={file.height}
                        width={file.width}
                        style={file.sender === myId.value
                            ? ""
                            : file.loaded < 100
                            ? "filter: blur(10px); transform: scale(1.1); transition: 500ms ease-in-out;"
                            : ""}
                        />
                        {#if file.loaded < 100}
                        <div
                            class="imageProgressCircle"
                            style="stroke-dasharray: {(file.loaded * 251.2) / 100}, 251.2;"
                        >
                            <svg viewBox="0 0 100 100">
                                {#if file.loaded > 0}
                                    <circle cx="50" cy="50" r="45" fill="transparent" />
                                    <path
                                        stroke-linecap="round"
                                        stroke-width="3"
                                        stroke="#fff"
                                        fill="none"
                                        d="M50 10
                                a 40 40 0 0 1 0 80
                                a 40 40 0 0 1 0 -80"
                                    >
                                    </path>
                                {/if}
                            </svg>
                            <div class="progress">
                                {#if file.loadScheme == "upload"}
                                    <i class="fa-solid fa-arrow-up"></i>
                                    {file.sender === myId.value ? `${file.loaded}%` : "Sending"}
                                {:else if file.loadScheme == "download"}
                                    <i class="fa-solid fa-arrow-down"></i>
                                    {file.loaded}%
                                {/if}
                            </div>
                        </div>
                        {/if}
                    {/if}
                </div>
            </div>
            <Reacts reactedBy={file.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .image {
        max-width: 100%;
        min-height: 100px;
        min-width: 100px;
        height: auto;
        //width: auto;
        max-height: 55vh;
        object-fit: contain;
    }

    .imageProgressCircle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        transform: translate(-50%, -50%);
        color: white;
        display: grid;
        place-items: center;
        background: rgba(0, 0, 0, 0.5);
        z-index: 12;

        svg {
            width: 65px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.25);
        }

        .progress {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #ffffffb5;
            font-size: 0.8rem;
        }
    }

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
        &:not(:has(img)) {
            padding: 5px 10px 10px 5px;
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
