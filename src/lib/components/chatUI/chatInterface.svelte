<script lang="ts">
    //css
    import "$lib/components/chatUI/chatComponents/messages/message.scss";

    //compoments
    import NavBar from "$lib/components/chatUI/chatComponents/navbar.svelte";
    import Messages from "$lib/components/chatUI/chatComponents/messages.svelte";
    import Footer from "$lib/components/chatUI/chatComponents/footer.svelte";

    import QuickSettings from "$lib/components/chatUI/chatComponents/quickSettingsModal.svelte";
    import Themes from "$lib/components/chatUI/chatComponents/themesModal.svelte";
    import StickersKeyboard from "$lib/components/chatUI/chatComponents/stickersKeyboard.svelte";
    import Attachments from "$lib/components/chatUI/chatComponents/sendAttachments.svelte";
    import MessageOptions from "$lib/components/chatUI/chatComponents/messageOptions.svelte";

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
    import { themes } from "$lib/themes";
    import { page } from "$app/stores";
    import { showToastMessage } from "domtoastmessage";

    let isOffline = false;

    let pressedOnce = false;
    let pressedOnceTimer: number;

    function exitChat(e?: Event) {

        //console.log(e);

        const isDefault = Object.values($page.state).some(
            (value) => value === true,
        );

        //console.log(isDefault, "Escape");

        if (isDefault) {
            history.back();
        } else {
            if (pressedOnce) {
                history.back();
            } else {
                showToastMessage("Go again to exit");

                if (e) {
                    console.log("Going forward");
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
            addState("/quickSettings", { showQuickSettingsPanel: true });
        }

        if (e.key === "t" && e.altKey) {
            addState("/themes", { showThemesPanel: true });
        }

        if (e.key === "i" && e.altKey) {
            addState("/stickers", {
                showStickersPanel: true,
            });
        }

        if (e.key === "a" && e.altKey) {
            addState("/attachments", { showAttachmentPickerPanel: true });
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

<!--svelte:window on:popstate|preventDefault={exitChat} /-->

<ConnectivityState bind:offline={isOffline} />

{#if $page.state.showQuickSettingsPanel}
    <QuickSettings />
{/if}

{#if $page.state.showThemesPanel}
    <Themes />
{/if}

{#if $page.state.showStickersPanel}
    <StickersKeyboard />
{/if}

<Attachments />

<MessageSockets />

{#if $eventTriggerMessageId}
    {#if $showMessageOptions}
        <MessageOptions />
    {/if}
    {#if $showReactsOnMessageModal}
        <ReactsOnMessage />
    {/if}
{/if}

<div class="container">
    <div class="chatBox" class:offl={isOffline}>
        <NavBar />
        <Messages />
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
