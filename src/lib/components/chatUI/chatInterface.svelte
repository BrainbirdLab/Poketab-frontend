<script lang="ts">
    //css
    import "$lib/components/chatUI/chatComponents/messages/message.scss";

    //compoments
    import NavBar from "$lib/components/chatUI/chatComponents/navbar.svelte";
    import Footer from "$lib/components/chatUI/chatComponents/footer.svelte";

    import QuickSettingsModal from "$lib/components/chatUI/chatComponents/quickSettingsModal.svelte";
    import ThemesModal from "$lib/components/chatUI/chatComponents/themesModal.svelte";
    import StickersKeyboardModal from "$lib/components/chatUI/chatComponents/stickersKeyboard.svelte";
    import AttachmentsModal from "$lib/components/chatUI/chatComponents/attachments.svelte";
    import MessageOptionsModal from "$lib/components/chatUI/chatComponents/messageOptions.svelte";

    import ReactsOnMessage from "$lib/components/chatUI/chatComponents/reactsOnMessageModal.svelte";

    import { addState, resetModals } from "./stateManager.svelte";

    import MessageSockets from "./messageSockets.svelte";

    //svelte methods
    import { onDestroy, onMount } from "svelte";

    //scripts
    import { eventTriggerMessageId, lastMessageId } from "$lib/messageTypes";
    import { chatRoomStore, myId, messageContainer } from "$lib/store";
    import { socket } from "$lib/socket";
    import { page } from "$app/stores";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import Lightbox from "./chatComponents/lightbox.svelte";
    import { infoMessage } from "$lib/utils/debug";

    let isOffline = false;

    let pressedOnce = false;
    let pressedOnceTimer: number | NodeJS.Timeout;

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

    let ready = false;

    onMount(() => {

        //reset all modals
        resetModals();

        document.onkeydown = keyBindingHandler;

        window.onfocus = () => {
            if (!$lastMessageId) {
                return;
            }

            socket.emit("seen", $myId, $chatRoomStore.Key, $lastMessageId);
        };

        infoMessage("You joined the chat 😸", "join");
        ready = true;
    });

    onDestroy(() => {

        if (document){
            document.onkeydown = null;
        }
        if (window){
            window.onfocus = null;
        }
    });

</script>

<svelte:head>
    <title>Poketab - Chat</title>
</svelte:head>

<AttachmentsModal />

{#if $page.state.viewImage != null}
    <Lightbox />
{/if}

{#if $page.state.showQuickSettingsPanel === true}
    <QuickSettingsModal />
{/if}

<ThemesModal />

{#if $page.state.showStickersPanel === true}
    <StickersKeyboardModal />
{/if}


<MessageSockets />

{#if $eventTriggerMessageId}
    {#if $page.state.showMessageOptions}
        <MessageOptionsModal />
    {/if}
    {#if $page.state.showReactsOnMessage}
        <ReactsOnMessage />
    {/if}
{/if}

<div class="chatBox" class:offl={isOffline}>
    <NavBar bind:encrypted={ready}/>
    <div class="middleLayer" on:touchmove|stopPropagation={(e) => {
        if (e.target == e.currentTarget) {
            e.preventDefault();
        }
    }}>
        <div class="messageContainer" bind:this={$messageContainer} >
            <slot name="messages" />
        </div>
        <Footer />
    </div>
</div>

<style lang="scss">

    .middleLayer {
        width: 100%;
        height: 100%;
        overflow: hidden;

        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        gap: 20px;

        .messageContainer{
            height: auto;
            overflow-y: scroll;
            overflow-x: hidden;
            scrollbar-width: none;
        }
    }

    .chatBox {

        inset: 0;
        overflow: hidden;

        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width: 100%;
        min-width: 240px;
        max-width: 100vw;
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
