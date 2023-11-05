<script lang="ts">
    import MessageInput from "./components/messageInput.svelte";
    import NavBar from "./components/navBar.svelte";
    import TextMessage from "./components/messages/message.svelte";
    import { messageDatabase } from "./components/messages/messages";
    import { showPopupMessage } from "$lib/utils/utils";
    import SidePanel from "./components/sidePanel.svelte";
    import { fade, fly } from "svelte/transition";
    import QuickSettings from "./components/quickSettings.svelte";
    import { onDestroy, onMount } from "svelte";
    import TypingIndicator from "./components/typingIndicator.svelte";
    import { chatSocket } from "./chatSocket";
    import {chatRoomStore} from "$lib/store";

    import { activeModalsStack, showAttachmentPickerPanel, showQuickSettingPanel, showSidePanel, showStickersPanel, showThemesPanel } from "./components/modalManager";

    onDestroy(()=>{
        chatSocket.disconnect();
    });

    async function invite(){
        try {
            if (!navigator.share) {
                showPopupMessage('Sharing in not supported by this browser');
                return;
            }
            await navigator.share({
                title: 'Poketab Messenger',
                text: 'Join chat!',
                url: `${location.origin}/join/${$chatRoomStore.Key}`,
            });
            showPopupMessage('Shared!');
        } catch (err) {
            showPopupMessage(`${err}`);
        }
    }

    //make a system where you can push and pop modals from the stack
//when a modal or panel is opened, push it to the stack
//when a new modal or panel is opened, push it to the stack
//when a modal or panel is closed, pop it from the stack
//when esc is pressed, pop the top modal or panel from the stack

document.addEventListener('keydown', (e) => {
    console.log(e.key);
    if (e.key === 'Escape'){
        if (activeModalsStack.length > 0){
            activeModalsStack[activeModalsStack.length - 1].set(false);
        }
    }

    if (e.key === 'o' && e.altKey){
        showSidePanel.update(value => !value);
    }

    if (e.key === 's' && e.altKey){
        showQuickSettingPanel.update(value => !value);
    }

    if (e.key === 't' && e.altKey){
        showThemesPanel.update(value => !value);
    }

    if (e.key === 'i' && e.altKey){
        showStickersPanel.update(value => !value);
    }

    if (e.key === 'a' && e.altKey){
        showAttachmentPickerPanel.update(value => !value);
    }
});
</script>

<SidePanel/>
<QuickSettings/>

<div class="chatBox">
    <NavBar />
    <ul class="messages" id="messages">

        <div class="welcome_wrapper" in:fly={{x: -50}} out:fade={{duration: 100}}>
            <li class="welcomeText">
                <img src="/images/greetings/{Math.floor(Math.random() * (9 - 1 + 1)) + 1}.webp" alt="Welcome Sticker" height="160px" width="160px" id="welcomeSticker">
                <div>Share this chat link to others to join</div>
                <button id="invite" class="clickable hover play-sound button" title="Click to share" on:click={invite}>Share <i class="fa-solid fa-share-nodes"></i></button>
            </li>
        </div>
        {#each [...$messageDatabase] as [id, message]}
            {#if message.type == 'text'}
                <TextMessage message={message} id={id}/>
            {/if}
        {/each}
    </ul>
    <TypingIndicator />
    <MessageInput />
</div>


<style lang="scss">
    .chatBox{
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
        background: rgba(0, 0, 0, 0.6117647059) var(--pattern);
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;

        &:global(.offl) {
            filter: saturate(0.4) brightness(0.8);
        }

        #messages{
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: scroll;
            overflow-x: hidden;
            color: var(--foreground-dark);
            scroll-behavior: smooth;
            scrollbar-width: none;
            list-style: none;
            z-index: 1;
            padding-bottom: 20px;
            width: 100%;

            .welcome_wrapper {
                display: grid;
                place-content: center;
                opacity: 1;
                visibility: visible;
                min-height: calc(80vh + 10px);
                transition: 500ms;
                .welcomeText {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    min-width: 200px;
                    width: 300px;
                    max-width: 90vw;
                    padding: 20px;
                    gap: 20px;
                    background: rgba(0, 0, 0, 0.6117647059);
                    border-radius: 15px;
                    #invite {
                        background: var(--secondary-dark);
                        color: var(--foreground-light);
                    }
                }
            }
        }
    }

    @media screen and (orientation: landscape) and (min-device-aspect-ratio: 1.5 / 1){
        .chatBox {
            width: 50%;
            min-width: 450px;
        }
    }
</style>