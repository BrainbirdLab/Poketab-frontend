<script lang="ts">
    import "$lib/components/chatUI/chatComponents/messages/message.scss";
    import Footer from "./chatComponents/footer.svelte";
    import TextMessage from "$lib/components/chatUI/chatComponents/messages/TextMessage.svelte";
    import {
        MessageObj,
        ServerMessageObj,
        StickerMessageObj,
        messageDatabase,
        eventTriggerMessageId,
        lastMessageId,
        replyTargetId,
        LocationMessageObj,
        TextMessageObj,
        messageContainer,
    } from "$lib/messageTypes";
    import { showToastMessage } from "$lib/components/toast";
    import SidePanel from "./chatComponents/sidePanel.svelte";
    import { fade, fly } from "svelte/transition";
    import QuickSettings from "./chatComponents/quickSettings.svelte";
    import { chatRoomStore, currentTheme, quickEmoji, selfInfoStore, userTypingString, type User, showScrollPopUp } from "$lib/store";
    import {
        activeModalsStack,
        selectedSticker,
        showAttachmentPickerPanel,
        showMessageOptions,
        showQuickSettingsPanel,
        showReactsOnMessageModal,
        showSidePanel,
        showStickersPanel,
        showThemesPanel,
    } from "$lib/components/modalManager";
    import ConnectivityState from "./chatComponents/connectivityState.svelte";
    import Themes from "./chatComponents/themes.svelte";
    import { tick, afterUpdate, beforeUpdate, onDestroy, onMount } from "svelte";
    import StickersKeyboard from "./chatComponents/stickersKeyboard.svelte";
    import Attachments from "./chatComponents/attachments.svelte";
    import MessageOptions from "./chatComponents/messageOptions.svelte";
    import StickerMessage from "$lib/components/chatUI/chatComponents/messages/StickerMessage.svelte";
    import ServerMessage from "$lib/components/chatUI/chatComponents/messages/ServerMessage.svelte";
    import { socket } from "$lib/components/socket";
    import { spring } from "svelte/motion";
    import { getFormattedDate, showReplyToast } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import DeletedMessage from "$lib/components/chatUI/chatComponents/messages/DeletedMessage.svelte";
    import LocationMessage from "$lib/components/chatUI/chatComponents/messages/LocationMessage.svelte";
    import NavBar from "./chatComponents/navbar.svelte";
    import hljs from "highlight.js";
    import { copyText, emojis } from "$lib/utils";
    import type { Unsubscriber } from "svelte/store";
    import ReactsOnMessage from "./chatComponents/reactsOnMessage.svelte";
    import { themes } from "$lib/themes";
    import MessageSockets from "./messageSockets.svelte";

    let isOffline = false;

    async function invite() {
        try {
            if (!navigator.share) {
                showToastMessage("Sharing in not supported by this browser");
                return;
            }
            await navigator.share({
                title: "Poketab Messenger",
                text: "Join chat!",
                url: `${location.origin}/chat/${$chatRoomStore.Key}`,
            });
            showToastMessage("Shared!");
        } catch (err) {
            showToastMessage(`${err}`);
        }
    }

    let timeStampInterval: number | null = null;

    let unsubMessageDatabase: Unsubscriber;

    let lastHeight = 0;
    let heightChanged = 0;
    let scrolledToBottomPx = 0;

    let timeout: number | null = null;

    /**
     * Auto scroll to bottom when new message arrives if scrolled to bottom if less that 200 px. (Smooth scroll)
     * If user reacts to message, lift up the messages that much it went down. And on react remove, if scrolled then scroll down that much px
    */

    beforeUpdate(() => {
        if (!$messageContainer) {
            return;
        }

        $messageContainer.style.height = 'auto';
    });


    afterUpdate(() => {
        if (!$messageContainer) {
            return;
        }

        $messageContainer.style.height = `${$messageContainer.offsetHeight}px`;

        scrolledToBottomPx = Math.floor($messageContainer.scrollHeight - $messageContainer.scrollTop - $messageContainer.offsetHeight);
        heightChanged = $messageContainer.scrollHeight - lastHeight;
    });

    async function updateUI(){

        await tick();

        if (!$messageContainer){
            return;
        }


        //console.log('update ui', heightChanged, scrolledToBottomPx);

        if (timeout){
            clearTimeout(timeout);
        }
        
        if (heightChanged < 10){
            if (heightChanged > 0) { //height increase
                $messageContainer.scrollTop += heightChanged;
                //console.log('%cScrolled Up', 'color: orange;');
            } else if (heightChanged < 0 && scrolledToBottomPx > 0){
                //console.log('%cScrolled Down', 'color: pink;');
                $messageContainer.scrollTop += heightChanged;
            }
        } else if (heightChanged > 10 && !$showScrollPopUp){
            //console.log('%cSmooth scroll', 'color: lime;');
            $messageContainer.scrollTo({
                top: $messageContainer.scrollHeight,
                behavior: "smooth",
            });
        }

        lastHeight = $messageContainer.scrollHeight;

        //last message
        const lastMessage = $messageContainer.lastElementChild as HTMLElement;
        
        if (!lastMessage.classList.contains("message")) {
            return;
        }
        
        //if last message is a code block, highlight it
        if (lastMessage.querySelector('code')){
            //highlight all code blocks
            lastMessage.querySelectorAll('code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        }

        const lastMessageObj = $messageDatabase.get(lastMessage.id) as MessageObj;

        if (!lastMessageObj) {
            return;
        }


        const timeStamp = lastMessageObj.timeStamp;

        if (timeStampInterval) {
            clearInterval(timeStampInterval);
        }

        //update time stamp of the last message
        timeStampInterval = setInterval(() => {
            const time = lastMessage.querySelector(".messageTime") as HTMLElement;
            if (!time) {
                return;
            }
            time.textContent = getFormattedDate(timeStamp);
        }, 10000);
    }

    const keyBindingHandler = (e: KeyboardEvent) => {
        //console.log(e.key);
        if (e.key === "Escape") {
            if (activeModalsStack.length > 0) {
                activeModalsStack[activeModalsStack.length - 1].set(false);
            }
        }

        if (e.key === "o" && e.altKey) {
            showSidePanel.update((value) => !value);
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

        unsubMessageDatabase = messageDatabase.subscribe(updateUI);

        document.onkeydown = keyBindingHandler;

        let loadedEmoji = localStorage.getItem('quickEmoji') || themes[$currentTheme].quickEmoji;

        if (!emojis.includes(loadedEmoji)){
            loadedEmoji = themes[$currentTheme].quickEmoji;
        }

        quickEmoji.set(loadedEmoji);

        window.onfocus = () => {
            if (!$lastMessageId) {
                //console.log('No last seen message');
                return;
            }

            //console.log(`Seen last message ${($messageDatabase.get($lastSeenMessage) as MessageObj).message} by ${$selfInfoStore.name}`);
            socket.emit("seen", $selfInfoStore.uid, $lastMessageId);
        };

        hljs.highlightAll();
    });

    onDestroy(() => {
        document.onkeydown = null;
        window.onfocus = null;
        if (unsubMessageDatabase){
            unsubMessageDatabase();
        }
    });

    function handleRightClick(e: MouseEvent) {
        e.preventDefault();
        const target: HTMLElement = e.target as HTMLElement;

        
        if (target.closest(".msg")) {
            const id = target.closest(".message")?.id;
            if (!id) {
                return;
            }
            
            if (!$messageDatabase.has(id)) {
                return;
            }

            const messageObj = $messageDatabase.get(id) as MessageObj;

            if (messageObj?.kind == 'deleted'){
                return;
            }

            eventTriggerMessageId.set(id);
            showMessageOptions.set(true);
        }
    }

    function handleMessages(node: HTMLElement) {
        //on horizontal scroll on a single message, move the message to swipe reply
        let xStart = 0;
        let yStart = 0;
        let xDiff = 0;
        let yDiff = 0;
        let horizontalSwipe = false;
        let touchEnded = true;
        let swipeStarted = false;
        let replyTrigger = false;

        const actionTimeout = new Map<string, number>();

        node.onclick = (evt) => {
            const target = evt.target as HTMLElement;

            if (target.tagName == "CODE"){
                return;
            }

            const message = target.closest(".message") as HTMLElement;

            if (!message) {
                return;
            }

            if (!$messageDatabase.has(message.id)){
                return;
            }

            const messageObj = $messageDatabase.get(message.id) as MessageObj;

            //show the time on click
            const time = message.querySelector(".messageTime") as HTMLElement;
            if (time) {

                time.textContent = getFormattedDate(messageObj.timeStamp);
                time.classList.add("active");

                if (actionTimeout.has(message.id + 'show-time')){
                    clearTimeout(actionTimeout.get(message.id + 'show-time') as number);
                }

                actionTimeout.set(message.id + 'show-time', setTimeout(() => {
                    time.classList.remove("active");
                    actionTimeout.delete(message.id + 'show-time');
                }, 1400));
            }

            if (target.classList.contains('reactsContainer')){
                eventTriggerMessageId.set(message.id);
                showReactsOnMessageModal.set(true);
                return;
            }

            //if message is a sticker, show the sticker panel of that group
            if (target.classList.contains("msg") && messageObj.kind == "sticker") {

                const stickerGroup = (messageObj as StickerMessageObj).groupName;
                selectedSticker.set(stickerGroup);
                showStickersPanel.set(true);
                return;
            }
            //if message is a reply, scroll to the replied message
            if (target.classList.contains("messageReply")) {

                const messageObj = $messageDatabase.get(message.id) as MessageObj;
                const replyId = messageObj.replyTo;
                //scroll to the replied message
                if (replyId) {
                    const replyMessage = document.getElementById(replyId);
                    if (replyMessage) {
                        replyMessage.classList.add("highlight");
                        replyMessage.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                        //use action timeout to remove highlight
                        if (actionTimeout.has(message.id + 'reply-highlight')){
                            clearTimeout(actionTimeout.get(message.id + 'reply-highlight') as number);
                        }

                        actionTimeout.set(message.id + 'reply-highlight', setTimeout(() => {
                            replyMessage.classList.remove("highlight");
                            actionTimeout.delete(message.id + 'reply-highlight');
                        }, 1400));
                    }
                }
                return;
            }

            if (target.classList.contains("copy-btn")){
                //copy the code
                const pre = target.closest('pre') as HTMLElement;
                if (!pre){
                    return;
                }

                const code = pre.querySelector('code') as HTMLElement;

                if (code){
                    const c = code.textContent;
                    if (!c?.trim()){
                        return;
                    }
                    
                    copyText(c);

                    target.dataset.action = 'Copied!';

                    if (actionTimeout.has(message.id + 'copy-code')){
                        clearTimeout(actionTimeout.get(message.id + 'copy-code') as number);
                    }

                    actionTimeout.set(message.id + 'copy-code', setTimeout(() => {
                        target.dataset.action = 'Copy';
                        actionTimeout.delete(message.id + 'copy-code');
                    }, 1000));

                    showToastMessage('Copied!');
                }

                return;
            }
        };

        // Listen for a swipe on left
        node.ontouchstart = (evt) => {
            const target = evt.target as HTMLElement;
            if (target.tagName == "CODE"){
                return;
            }
            if (target.closest(".message")) {
                xStart = evt.touches[0].clientX / 3;
                yStart = evt.touches[0].clientY / 3;
            }
        };

        node.ontouchmove = (evt) => {
            try {
                const target = evt.target as HTMLElement;

                if (target.tagName == "CODE"){
                    return;
                }

                const message = target.closest(".message") as HTMLElement;

                if (target.closest(".msg") && $messageDatabase.has(message.id) && ($messageDatabase.get(message.id) as MessageObj).kind != 'deleted') {
                    //console.log(xDiff);

                    xDiff = xStart - evt.touches[0].clientX / 3;
                    yDiff = yStart - evt.touches[0].clientY / 3;

                    //which direction is swipe was made first time
                    if (horizontalSwipe == false) {
                        if (Math.abs(xDiff) > Math.abs(yDiff) && touchEnded) {
                            horizontalSwipe = true;
                        } else {
                            horizontalSwipe = false;
                        }
                    }

                    touchEnded = false;

                    //if horizontal
                    if (horizontalSwipe) {
                        //console.log('horizontal');
                        const replyIcon = message.querySelector(".replyIcon") as HTMLElement;

                        const { classList, sent } = $messageDatabase.get(message.id) as MessageObj;

                        swipeStarted = true;
                        replyIcon.dataset.swipeStart = "true";
                        
                        //if msg is self
                        if (classList.includes("self") && sent) {
                            if (xDiff >= 50) {
                                replyTrigger = true;
                                replyIcon.dataset.replyTrigger = "true";
                                replyIcon.style.transform = `translateX(${xDiff}px)`;
                            } else {
                                replyTrigger = false;
                                replyIcon.dataset.replyTrigger = "false";
                            }
                            xDiff = xDiff < 0 ? 0 : xDiff;
                            message.style.transform = `translateX(${-xDiff}px)`;
                        } else {
                            if (xDiff <= -50) {
                                replyTrigger = true;
                                replyIcon.dataset.replyTrigger = "true";
                                replyIcon.style.transform = `translateX(${xDiff}px)`;
                            } else {
                                replyTrigger = false;
                                replyIcon.dataset.replyTrigger = "false";
                            }
                            xDiff = xDiff > 0 ? 0 : xDiff;
                            message.style.transform = `translateX(${-xDiff}px)`;
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        };

        let unsub: () => void;

        node.ontouchend = (evt) => {
            try {
                if (!swipeStarted) return;

                const target = evt.target as HTMLElement;
                const message = target.closest(".message") as HTMLElement;

                if (target.closest(".msg") && $messageDatabase.has(message.id)) {
                    touchEnded = true;

                    const { classList, sent } = $messageDatabase.get(
                        message.id,
                    ) as MessageObj;

                    swipeStarted = false;

                    horizontalSwipe = false;

                    const replyIcon = message.querySelector(".replyIcon",) as HTMLElement;

                    if (classList.includes("self") && sent) {
                        replyIcon.style.transform = "translateX(50px)";
                    } else {
                        replyIcon.style.transform = "translateX(-50px)";
                    }
                        
                    replyIcon.dataset.swipeStart = "false";
                    
                    //use spring animation to translate back to 0
                    const x = spring(xDiff, { stiffness: 0.5, damping: 0.5 });
                    unsub = x.subscribe((value) => {
                        message.style.transform = `translateX(${value}px)`;
                    });
                    x.set(0);
                    
                    if (replyTrigger) {

                        replyTargetId.set(message.id);

                        showReplyToast.set(true);

                        replyTrigger = false;
                        replyIcon.dataset.replyTrigger = "false";
                    }
                }
            } catch (e) {
                console.log(e);
            }
        };

        return {
            destroy() {
                node.ontouchstart = null;
                node.ontouchmove = null;
                node.ontouchend = null;
                node.onclick = null;
                if (unsub) unsub();
            },
        };
    }
</script>

<svelte:head>
    <title>Poketab - Chat</title>
</svelte:head>

<div class="container">
    <div class="chatBox" class:offl={isOffline}>
        <NavBar />
        <ul class="messages" use:handleMessages on:contextmenu={handleRightClick} id="messages" bind:this={$messageContainer}>
            <div class="welcome_wrapper" in:fade>
                <li class="welcomeText">
                    <img src="/images/greetings/{Math.floor(Math.random() * (9 - 1 + 1)) + 1}.webp" alt="Welcome Sticker" height="160px" width="160px" id="welcomeSticker" />
                    <div>Share this chat link to others to join</div>
                    <button id="invite" class="clickable hover play-sound button" title="Click to share" on:click={invite}>
                        Share
                        <i class="fa-solid fa-share-nodes"></i>
                    </button>
                </li>
            </div>
            {#each [...$messageDatabase] as [id, message]}
                {#if message instanceof MessageObj}
                    {#if message instanceof TextMessageObj && message.kind == "text"}
                        <TextMessage message={message} id={id} />
                    {:else if message instanceof StickerMessageObj}
                        <StickerMessage message={message} id={id}/>
                    {:else if message instanceof TextMessageObj && message.kind == "deleted"}
                        <DeletedMessage message={message} id={id}/>
                    {/if}
                {:else if message instanceof ServerMessageObj}
                    <ServerMessage message={message} id={id} />
                {:else if message instanceof LocationMessageObj}
                    <LocationMessage id={id} lat={message.lat} lon={message.lon} uid={message.uid}/>
                {/if}
            {/each}
        </ul>
        <Footer/>
    </div>
</div>

<ConnectivityState bind:offline={isOffline} />

<SidePanel />

<QuickSettings />

<Themes />

<StickersKeyboard />

<Attachments />

<MessageOptions />

<ReactsOnMessage />

<MessageSockets />

<style lang="scss">
    .container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
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

        #messages {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: scroll;
            overflow-x: hidden;
            color: var(--foreground-dark);
            scrollbar-width: none;
            list-style: none;
            z-index: 1;
            margin-bottom: 20px;
            width: 100%;

            .welcome_wrapper {
                display: grid;
                place-content: center;
                opacity: 1;
                visibility: visible;
                min-height: calc(80vh + 25px);
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

    @media screen and (orientation: landscape) and (min-device-aspect-ratio: 1.5 / 1) {
        .chatBox {
            width: 50%;
            min-width: 450px;
        }
    }
</style>
