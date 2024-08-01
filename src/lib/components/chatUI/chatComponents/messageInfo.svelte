<script lang="ts">
    import { bufferToHexCode } from "$lib/e2e/encryption";
    import type { MessageObj } from "$lib/messageTypes";
    import { onDestroy, onMount } from "svelte";
    import { getFormattedDate } from "./messages/messageUtils";
    import { chatRoomStore } from "$lib/store";
    import { slide } from "svelte/transition";

    export let message: MessageObj;

    let smKeyStr: string;
    let msgTime: string;
    let timeStampInterval: number;

    onMount(async () => {
        //convert symmetric key to string
        if (!message.smKey) {
            return;
        }
        const raw = await crypto.subtle.exportKey("raw", message.smKey);
        smKeyStr = bufferToHexCode(raw);

        msgTime = getFormattedDate(message.timeStamp);

        if (timeStampInterval) {
            clearInterval(timeStampInterval);
        }

        //update time stamp of the last message
        timeStampInterval = setInterval(() => {
            msgTime = getFormattedDate(message.timeStamp);
        }, 1000);
    });

    onDestroy(() => {
        clearInterval(timeStampInterval);
    })
</script>

{#if smKeyStr}
    <div class="container"  in:slide={{axis: "y", duration: 200}}>
        <div class="title">
            <i class="fa-solid fa-info-circle"></i> Message information
        </div>
        <div class="sub-container">
            <div class="sub-title">
                Sender
            </div>
            <div class="content flex">
                <img
                    src="/images/avatars/{$chatRoomStore.userList[message.sender]
                        .avatar}(custom).webp"
                    height="20"
                    width="20"
                    alt="{$chatRoomStore.userList[message.sender].avatar}"
                />
                {$chatRoomStore.userList[message.sender].avatar}
            </div>
        </div>
        <div class="sub-container">
            <div class="sub-title">Sent on</div>
            <div class="content">
                {msgTime}
            </div>
        </div>
        <div class="sub-container">
            <div class="sub-title">Encryption key</div>
            <div class="content monospace user-select">
                {smKeyStr}
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    .flex{
        display: flex;
        align-items: flex-end;
        gap: 3px;
    }
    .title{
        font-size: 0.9rem;
        color: var(--transparent-white-color);
        i {
            font-size: inherit;
            color: inherit;
        }
    }
    .sub-title {
        font-size: 0.8rem;
        color: var(--secondary-dark);
    }
    .content {
        font-size: 0.8rem;
        color: var(--transparent-white-color);
    }
</style>
