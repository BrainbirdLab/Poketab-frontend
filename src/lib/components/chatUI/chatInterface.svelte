<script lang="ts">
    //css
    import "$lib/components/chatUI/chatComponents/messages/message.scss";
    
    //compoments
    import QuickSettings from "$lib/components/chatUI/chatComponents/quickSettings.svelte";
    import Themes from "$lib/components/chatUI/chatComponents/themes.svelte";
    import StickersKeyboard from "$lib/components/chatUI/chatComponents/stickersKeyboard.svelte";
    import Attachments from "$lib/components/chatUI/chatComponents/attachments.svelte";
    import MessageOptions from "$lib/components/chatUI/chatComponents/messageOptions.svelte";

    import ReactsOnMessage from "$lib/components/chatUI/chatComponents/reactsOnMessage.svelte";
    import ConnectivityState from "$lib/components/chatUI/chatComponents/connectivityState.svelte";
    
    import MessageSockets from "./messageSockets.svelte";

    //svelte methods
    import {  onDestroy, onMount } from "svelte";


    //scripts
    import {
        eventTriggerMessageId,
        lastMessageId,
    } from "$lib/messageTypes";
    import {
        activeModalsStack,
        showAttachmentPickerPanel,
        showMessageOptions,
        showQuickSettingsPanel,
        showReactsOnMessageModal,
        showStickersPanel,
        showThemesPanel,
    } from "$lib/components/modalManager";
    import { chatRoomStore, currentTheme, myId, userTypingString, quickEmoji } from "$lib/store";
    import { socket } from "$lib/components/socket";
    import { themes } from "$lib/themes";

    let isOffline = false;

    const keyBindingHandler = (e: KeyboardEvent) => {
        //console.log(e.key);
        if (e.key === "Escape") {
            if (activeModalsStack.length > 0) {
                activeModalsStack[activeModalsStack.length - 1].set(false);
            }
        }

        if (e.key === "s" && e.altKey) {
            showQuickSettingsPanel.update((value) => !value);
        }

        if (e.key === "t" && e.altKey) {
            showThemesPanel.update((value) => !value);
        }

        if (e.key === "i" && e.altKey) {
            showStickersPanel.update((value) => !value);
        }

        if (e.key === "a" && e.altKey) {
            showAttachmentPickerPanel.update((value) => !value);
        }

        if (e.altKey === true && e.key === "3"){
            userTypingString.set('You are typing');
            console.log('typing');
        }

        if (e.altKey === true && e.key === "4"){
            userTypingString.set('');
            console.log('typing end');
        }
    };

    onMount(() => {

        //$messageContainer.style.height = `${$messageContainer.offsetHeight}px`;
        quickEmoji.set(themes[$currentTheme].quickEmoji);

        document.onkeydown = keyBindingHandler;

        window.onfocus = () => {
            if (!$lastMessageId) {
                //console.log('No last seen message');
                return;
            }

            //console.log(`Seen last message ${($messageDatabase.get($lastSeenMessage) as MessageObj).message} by ${$selfInfoStore.name}`);
            socket.emit("seen", $myId, $chatRoomStore.Key, $lastMessageId);
        };
        console.log("Mounted chatInterface.svelte");
    });

    onDestroy(() => {
        document.onkeydown = null;
        window.onfocus = null;
        window.onresize = null;
    });

</script>

<svelte:head>
    <title>Poketab - Chat</title>
</svelte:head>


<ConnectivityState bind:offline={isOffline} />

{#if $showQuickSettingsPanel}
    <QuickSettings />
{/if}

<Themes />

{#if $showStickersPanel}
    <StickersKeyboard />
{/if}

<Attachments />

<MessageSockets />

{#if $eventTriggerMessageId}
{#if $showMessageOptions}
    <MessageOptions/>
{/if}
{#if $showReactsOnMessageModal}
    <ReactsOnMessage/>
{/if}
{/if}

<div class="container">
    <div class="chatBox" class:offl={isOffline}>
        <slot/>
    </div>
</div>

<style lang="scss">
    .container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        inset: 0;
        position: relative;
        overflow: hidden;
    }

    .chatBox {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
        min-width: 240px;
        max-width: 100vw;
        position: relative;
        height: 100%;
        transition: filter 100ms;
        position: relative;
        align-items: center;
        height: var(--app-height);
        max-height: 100vh;
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }

    .chatBox.offl {
        filter: saturate(0.4) brightness(0.5);
        pointer-events: none;
    }

    @media screen and (orientation: landscape) and (min-device-aspect-ratio: 1.5 / 1) {
        .chatBox {
            width: 50%;
            min-width: 450px;
        }
    }
</style>
