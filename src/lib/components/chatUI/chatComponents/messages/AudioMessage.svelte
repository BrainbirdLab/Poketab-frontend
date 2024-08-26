<script lang="ts">
    import type { AudioMessageObj } from "$lib/messageTypes";
    import Reacts from "./messageMetaComponents/reactsGroup.svelte";
    import MessageTop from "./messageMetaComponents/messageTop.svelte";
    import SeenBy from "./messageMetaComponents/seenBy.svelte";
    import MessageMeta from "./messageMetaComponents/dpAndSentIcon.svelte";
    import { fly } from "svelte/transition";
    import { remainingTime } from "./messageUtils";
    import { myId } from "$lib/store";

    export let file: AudioMessageObj;

    let duration = file.duration;
</script>

<li class="message msg-item {file.classList}" id="{file.id}"> <!-- noreply notitle delevered start end self react -->
    <SeenBy seenBy={file.seenBy} id={file.id} />
    <div class="messageContainer">
        <MessageMeta senderId={file.sender} isSent={file.sent}/>
        <div class="messageBody">
            <MessageTop senderId={file.sender} classList={file.classList} replyTo={file.replyTo}/>
            <div class="msg" data-mtype="file">
                <div class="data" style="--progress: { (file.audio.currentTime / duration) * 100 }%; transition: {file.audio.currentTime === 0 ? "none" : "150ms"};">
                    <div class="controls">
                        {#if file.audio.paused || file.audio.ended}
                            <i class="control fa-solid fa-play"></i>
                        {:else if !file.audio.paused && !file.audio.ended}
                            {#if isFinite(duration)}
                                <i class="control fa-solid fa-pause"></i>
                            {:else}
                                <i class="fa-solid fa-circle-notch fa-spin"></i>
                            {/if}
                        {/if}
                    </div>
                    <div class="progress-container">
                        <div class="progressBar"></div>
                    </div>
                    <div class="duration">
                        {#if file.loaded < 100}
                            {#if file.loadScheme == "upload"}
                                <i class="fa-solid fa-arrow-up"
                                ></i>
                                { file.sender === $myId ? `${file.loaded}%` : "Sending" }
                            {:else if file.loadScheme == "download"}
                                <i
                                    class="fa-solid fa-arrow-down"
                                ></i>
                                {file.loaded}%
                            {/if}
                        {:else}
                            {#if file.audio.paused}
                                {#if isFinite(duration)}
                                    {#if file.audio.currentTime > 0}
                                    {remainingTime(duration, file.audio.currentTime)}
                                    {:else}
                                    {remainingTime(duration, 0)}
                                    {/if}
                                {:else}
                                    --:--
                                {/if}
                            {:else}
                                {remainingTime(duration, file.audio.currentTime)}
                            {/if}
                        {/if}
                    </div>
                </div>
            </div>
            <Reacts reactedBy={file.reactedBy} />
        </div>
    </div>
</li>

<style lang="scss">

    .data{
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        padding: 5px 10px;
        min-width: 220px;
        width: 100%;
        height: 35px;
        min-height: 35px;
        position: relative;

        .progress-container{
            position: relative;
            width: 100%;
            height: 50%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
        }

        .progressBar{
            position: relative;
            width: 100%;
            height: 2px;
            background: var(--glass-color);
            pointer-events: none;
            &::after{
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                width: var(--progress);
                max-width: 100%;
                pointer-events: none;
                background: var(--transparent-white-color);
                z-index: 2;
            }
        }


        .controls{
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            background: var(--text-color);
            border-radius: 25px;
            height: 23px;
            width: 23px;
            min-width: 23px;
            min-height: 23px;
            max-height: 23px;
            max-width: 23px;
            aspect-ratio: 1 / 1;
            margin-left: -3.5px;
        }

        .control{
            font-size: 12px;
            width: 20px;
            height: 20px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--message-color) !important;
            z-index: 2;
        }

        .duration{
            font-size: 0.6rem;
            background: var(--text-color);
            border-radius: 10px;
            padding: 2px 5px;
            min-width: 40px;
            height: 18px;
            min-height: 18px;
            margin-right: -2px;
            color: var(--message-color);
            text-align: center;
            pointer-events: none;
            z-index: 2;
            * {
                color: inherit !important;
                font-size: inherit !important;
            }
        }
    }

</style>