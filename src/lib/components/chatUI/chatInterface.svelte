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

    //svelte methods
    import { onDestroy, onMount } from "svelte";

    //scripts
    import { chatRoomStore, myId } from "$lib/store.svelte";
    import { socket } from "$lib/connection/socketClient";
    import { page } from "$app/stores";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import Lightbox from "./chatComponents/lightbox.svelte";
    import { infoMessage } from "$lib/utils/debug";
    import DropBox from "./chatComponents/dropBox.svelte";
    import Messages from "./chatComponents/messages.svelte";
    import type { LightBoxTargettype } from "$lib/types";
    import { lastMessageId, eventTriggerMessageId } from "$lib/messageStore.svelte";

    let showFilePicker = $state(false);
    let sendAsType: 'file' | 'image' | 'audio' = $state('file');

    let lightboxTarget: LightBoxTargettype | null = $state(null);

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

    let ready = $state(false);

    onMount(() => {

        //reset all modals
        resetModals();

        document.onkeydown = keyBindingHandler;

        window.onfocus = () => {
            if (!lastMessageId.value) {
                return;
            }

            socket.emit("seen", myId.value, chatRoomStore.value.Key, lastMessageId.value);
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

<DropBox bind:sendAsType={sendAsType} bind:showFilePicker={showFilePicker}/>
<AttachmentsModal bind:sendAsType={sendAsType} bind:showFilePicker={showFilePicker}/>

{#if $page.state.showLightBox}
    <Lightbox target={lightboxTarget}/>
{/if}

{#if $page.state.showQuickSettingsPanel === true}
    <QuickSettingsModal />
{/if}

<ThemesModal />

{#if $page.state.showStickersPanel === true}
    <StickersKeyboardModal />
{/if}

{#if eventTriggerMessageId.value}
    {#if $page.state.showMessageOptions}
        <MessageOptionsModal />
    {/if}
    {#if $page.state.showReactsOnMessage}
        <ReactsOnMessage />
    {/if}
{/if}

<div class="chatBox" class:offl={isOffline}>
    <NavBar bind:encrypted={ready}/>
    <div class="middleLayer" ontouchmove={(e) => {
        e.stopPropagation();
        if (e.target == e.currentTarget) {
            e.preventDefault();
        }
    }}>
        <Messages bind:lightBoxTarget={lightboxTarget}/>
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
