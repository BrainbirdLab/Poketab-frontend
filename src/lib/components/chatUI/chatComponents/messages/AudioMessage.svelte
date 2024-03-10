<script lang="ts">
    import type { AudioMessageObj } from "$lib/messageTypes";
    import Reacts from "./messageComponents/reacts.svelte";
    import MessageTop from "./messageComponents/messageTop.svelte";
    import SeenBy from "./messageComponents/seenBy.svelte";
    import MessageMeta from "./messageComponents/messageMeta.svelte";
    import { fly } from "svelte/transition";
    import { remainingTime } from "./messageUtils";
    import { myId } from "$lib/store";

    export let file: AudioMessageObj;

    let duration = file.duration;
</script>

<li class="message msg-item {file.classList}" id="{file.id}" bind:this={file.ref}> <!-- noreply notitle delevered start end self react -->
    <SeenBy seenBy={file.seenBy} id={file.id} />
    <div class="messageContainer">
        <MessageMeta senderId={file.sender} isSent={file.sent}/>
        <div class="messageBody">
            <MessageTop senderId={file.sender} classList={file.classList} replyTo={file.replyTo}/>
            <div class="messageMain">
                <div class="msg" data-mtype="file">
                    <div class="data" style="--progress: { (file.audio.currentTime / duration) * 100 }%; transition: {file.audio.currentTime === 0 ? "none" : "150ms"};">
                        <div class="controls">

                            {#if file.audio.paused || file.audio.ended}
                                <i in:fly|global={{x: 5}} class="control fa-solid fa-play"></i>
                            {:else if !file.audio.paused && !file.audio.ended}
                                {#if isFinite(duration)}
                                    <i in:fly|global={{x: -5}} class="control fa-solid fa-pause"></i>
                                    <i in:fly|global={{x: 5}} class="control fa-solid fa-stop"></i>
                                {:else}
                                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                                {/if}
                            {/if}

                        </div>
                        {#if file.loaded < 100}
                            <div class="progress">
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
                            </div>
                        {/if}
                        <div class="duration">
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
                        </div>
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
        align-items: center;
        justify-content: space-between;
        flex-direction: row;
        padding: 5px 10px;
        min-width: 220px;
        height: 34px;
        position: relative;

        &::before{
            content: "";
            position: absolute;
            bottom: 0;
            left: 0;
            width: var(--progress, 0%);
            height: 100%;
            background: #00000026;
            pointer-events: none;
            transition: inherit;
            z-index: 1;
        }

        .controls{
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
        }

        .control{
            font-size: 17px;
            width: 20px;
            height: 20px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--secondary-dark);
            z-index: 2;
        }

        .duration{
            font-size: 0.6rem;
            background: var(--foreground-dark);
            border-radius: 10px;
            padding: 2px 5px;
            min-width: 40px;
            color: var(--secondary-dark);
            text-align: center;
            pointer-events: none;
            z-index: 2;
        }
    }

</style>