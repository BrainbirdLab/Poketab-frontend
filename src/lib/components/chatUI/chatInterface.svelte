<script lang="ts">
    //css
    import "$lib/components/chatUI/chatComponents/messages/message.scss";

    //compoments
    import NavBar from "$lib/components/chatUI/chatComponents/navbar.svelte";
    import Footer from "$lib/components/chatUI/chatComponents/footer.svelte";

    import QuickSettingsModal from "$lib/components/chatUI/chatComponents/quickSettingsModal.svelte";
    import ThemesModal , { themes } from "$lib/components/chatUI/chatComponents/themesModal.svelte";
    import StickersKeyboardModal from "$lib/components/chatUI/chatComponents/stickersKeyboard.svelte";
    import AttachmentsModal from "$lib/components/chatUI/chatComponents/sendAttachments.svelte";
    import MessageOptionsModal from "$lib/components/chatUI/chatComponents/messageOptions.svelte";

    import ReactsOnMessage from "$lib/components/chatUI/chatComponents/reactsOnMessageModal.svelte";
    import ConnectivityState from "$lib/components/chatUI/chatComponents/connectivityState.svelte";

    import { addState } from "./stateManager.svelte";

    import MessageSockets from "./messageSockets.svelte";

    //svelte methods
    import { onDestroy, onMount } from "svelte";

    //scripts
    import { eventTriggerMessageId, lastMessageId } from "$lib/messageTypes";
    import {
        //activeModalsStack,
        //showAttachmentPickerPanel,
        showMessageOptions,
        //showQuickSettingsPanel,
        showReactsOnMessageModal,
        //showStickersPanel,
        //showThemesPanel,
    } from "$lib/components/modalManager";
    import { chatRoomStore, currentTheme, myId, quickEmoji } from "$lib/store";
    import { socket } from "$lib/components/socket";
    import { page } from "$app/stores";
    import { showToastMessage } from "@itsfuad/domtoastmessage";

    let isOffline = false;

    let pressedOnce = false;
    let pressedOnceTimer: number;

    function exitChat(e?: Event) {

        const isDefault = Object.values($page.state).some(
            (value) => value === true,
        );

        if (isDefault) {
            history.back();
        } else {
            if (pressedOnce) {
                history.back();
            } else {
                showToastMessage("Go again to exit");

                if (e) {
                    history.forward();
                }

                pressedOnce = true;
                clearTimeout(pressedOnceTimer);
                pressedOnceTimer = setTimeout(() => {
                    pressedOnce = false;
                }, 2000);
            }
        }
    }

    const keyBindingHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            exitChat();
        }

        if (e.key === "s" && e.altKey) {
            addState("quickSettings", { showQuickSettingsPanel: true });
        }

        if (e.key === "t" && e.altKey) {
            addState("themes", { showThemesPanel: true });
        }

        if (e.key === "i" && e.altKey) {
            addState("stickers", {
                showStickersPanel: true,
            });
        }

        if (e.key === "a" && e.altKey) {
            addState("attachments", { showAttachmentPickerPanel: true });
        }
    };

    onMount(() => {
        //$messageContainer.style.height = `${$messageContainer.offsetHeight}px`;
        quickEmoji.set(themes[$currentTheme].quickEmoji);

        document.onkeydown = keyBindingHandler;

        window.onfocus = () => {
            if (!$lastMessageId) {
                return;
            }

            socket.emit("seen", $myId, $chatRoomStore.Key, $lastMessageId);
        };
    });

    onDestroy(() => {
        if (document){
            document.onkeydown = null;
        }
        if (window){
            window.onfocus = null;
            window.onresize = null;
        }
    });
</script>

<svelte:head>
    <title>Poketab - Chat</title>
</svelte:head>

<ConnectivityState bind:offline={isOffline} />

{#if $page.state.showQuickSettingsPanel === true}
    <QuickSettingsModal />
{/if}

<ThemesModal />

{#if $page.state.showStickersPanel === true}
    <StickersKeyboardModal />
{/if}

<AttachmentsModal />

<MessageSockets />

{#if $eventTriggerMessageId}
    {#if $showMessageOptions}
        <MessageOptionsModal />
    {/if}
    {#if $showReactsOnMessageModal}
        <ReactsOnMessage />
    {/if}
{/if}

<div class="container">
    <div class="chatBox" class:offl={isOffline}>
        <NavBar />
            <slot name="messages" />
        <Footer />
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
