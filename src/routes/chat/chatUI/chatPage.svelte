<script lang="ts">
        import "./components/messages/message.scss";
    import MessageInput from "./components/messageInput.svelte";
    import NavBar from "./components/navBar.svelte";
    import TextMessage from "./components/messages/message.svelte";
    import { MessageObj, ServerMessageObj, StickerMessageObj, messageDatabase, targetMessage, lastSeenMessage } from "$lib/messages";
    import { showPopupMessage } from "$lib/utils/utils";
    import SidePanel from "./components/sidePanel.svelte";
    import { fade, fly } from "svelte/transition";
    import QuickSettings from "./components/quickSettings.svelte";
    import TypingIndicator from "./components/typingIndicator.svelte";
    import { chatRoomStore, selfInfoStore } from "$lib/store";
    import { activeModalsStack, showAttachmentPickerPanel, showMessageOptions, showQuickSettingsPanel, showSidePanel, showStickersPanel, showThemesPanel } from "./components/modalManager";
    import ConnectivityState from "./components/connectivityState.svelte";
    import Themes from "./components/themes.svelte";
    import { afterUpdate, beforeUpdate, onDestroy, onMount } from "svelte";
    import StickersKeyboard from "./components/stickersKeyboard.svelte";
    import Attachments from "./components/attachments.svelte";
    import MessageOptions from "./components/messageOptions.svelte";
    import StickerMessage from "./components/messages/stickerMessage.svelte";
    import ServerMessage from "./components/messages/serverMessage.svelte";
    import { socket } from "../../socket";

    let isOffline = false;

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


    let autoScroll = true;

    let messages: HTMLElement;

    beforeUpdate(() => {
        autoScroll = messages && (messages.offsetHeight + messages.scrollTop) > (messages.scrollHeight - 200);
    });

    afterUpdate(() => {
        if (autoScroll) {
            messages.scrollTop = messages.scrollHeight;
        }
    });



    const keyBindingHandler = (e: KeyboardEvent) => {
        //console.log(e.key);
        if (e.key === 'Escape'){
            if (activeModalsStack.length > 0){
                activeModalsStack[activeModalsStack.length - 1].set(false);
            }
        }

        if (e.key === 'o' && e.altKey){
            showSidePanel.update(value => !value);
        }

        if (e.key === 's' && e.altKey){
            showQuickSettingsPanel.update(value => !value);
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
    }

    onMount(()=> {
        //make a system where you can push and pop modals from the stack
        //when a modal or panel is opened, push it to the stack
        //when a new modal or panel is opened, push it to the stack
        //when a modal or panel is closed, pop it from the stack
        //when esc is pressed, pop the top modal or panel from the stack
        document.onkeydown = keyBindingHandler;

        window.addEventListener('focus', () => {
            /*
            if (lastNotification != undefined) {
                lastNotification.close();
            }
            */
           if (!$lastSeenMessage){
                console.log('No last seen message');
                return;
           }
            console.log(`Seen last message ${($messageDatabase.get($lastSeenMessage) as MessageObj).message} by ${$selfInfoStore.name}`);
            socket.emit('seen', $selfInfoStore.uid, $lastSeenMessage );
        });
    });

    onDestroy(()=> {
        document.onkeydown = null;
    });

    function handleRighClick(e: MouseEvent){
        e.preventDefault();
        const target: HTMLElement = e.target as HTMLElement;
        console.log(target);
        if (target.classList.contains('msg')){
            const id = target.closest('.message')?.id;
            if (id){
                console.log(id);
                targetMessage.set(id);
                showMessageOptions.set(true);
            }
        }
    }

    


</script>

<svelte:head>
    <title>Poketab - Chat</title>
</svelte:head>

<SidePanel/>
<QuickSettings/>
<Themes/>
<StickersKeyboard/>
<Attachments/>
<ConnectivityState bind:offline={isOffline}/>
<MessageOptions/>

<div class="container">
    <div class="chatBox" class:offl={isOffline}>
        <NavBar />
        <ul class="messages" on:contextmenu={handleRighClick} id="messages" bind:this={messages}>
    
            <div class="welcome_wrapper" in:fly={{x: -50}} out:fade={{duration: 100}}>
                <li class="welcomeText">
                    <img src="/images/greetings/{Math.floor(Math.random() * (9 - 1 + 1)) + 1}.webp" alt="Welcome Sticker" height="160px" width="160px" id="welcomeSticker">
                    <div>Share this chat link to others to join</div>
                    <button id="invite" class="clickable hover play-sound button" title="Click to share" on:click={invite}>Share <i class="fa-solid fa-share-nodes"></i></button>
                </li>
            </div>
            {#each [...$messageDatabase] as [id, message]}
                {#if message instanceof MessageObj}
                    {#if message.type === 'text' || message.type === 'emoji'}
                        <TextMessage message={message} id={id}/>
                    {:else if message.type === 'sticker'}
                        <StickerMessage message={Object.setPrototypeOf(message, StickerMessageObj.prototype)} id={id}/>
                    {/if}
                {:else if message instanceof ServerMessageObj}
                    <ServerMessage message={message} id={id}/>
                {/if}
            {/each}
        </ul>
        <TypingIndicator />
        <MessageInput />
    </div>
</div>

<style lang="scss">

    .container{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        position: relative;
        overflow: hidden;
    }

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
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;

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

    .chatBox.offl {
        filter: saturate(0.4) brightness(0.5);
        pointer-events: none;
    }

    @media screen and (orientation: landscape) and (min-device-aspect-ratio: 1.5 / 1){
        .chatBox {
            width: 50%;
            min-width: 450px;
        }
    }
</style>