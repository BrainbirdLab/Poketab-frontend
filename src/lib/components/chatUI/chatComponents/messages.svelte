<script module lang="ts">
    let currentPlayingAudioMessage: AudioMessageObj | null = null;

    const actionTimeout = new Map<string, number | NodeJS.Timeout>();

    export function focusMessage(replyId: string) {
        if (replyId) {
            const replyMessage = document.getElementById(replyId);
            if (replyMessage) {
                replyMessage.classList.add("highlight");
                replyMessage.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                //use action timeout to remove highlight
                if (actionTimeout.has(replyId + 'reply-highlight')){
                    clearTimeout(actionTimeout.get(replyId + 'reply-highlight') as number);
                }

                actionTimeout.set(replyId + 'reply-highlight', setTimeout(() => {
                    replyMessage.classList.remove("highlight");
                    actionTimeout.delete(replyId + 'reply-highlight');
                }, 1400));
            }
        }
    }

</script>

<script lang="ts">
    import TextMessage from "$lib/components/chatUI/chatComponents/messages/TextMessage.svelte";
    import StickerMessage from "$lib/components/chatUI/chatComponents/messages/StickerMessage.svelte";
    import ServerMessage from "$lib/components/chatUI/chatComponents/messages/ServerMessage.svelte";
    import DeletedMessage from "$lib/components/chatUI/chatComponents/messages/DeletedMessage.svelte";
    import LocationMessage from "$lib/components/chatUI/chatComponents/messages/LocationMessage.svelte";
    import FileMessage from "$lib/components/chatUI/chatComponents/messages/FileMessage.svelte";
    import AudioMessage from "$lib/components/chatUI/chatComponents/messages/AudioMessage.svelte";

    //svelte methods
    import { fade } from "svelte/transition";
    import { spring } from "svelte/motion";

    //scripts
    import {
        MessageObj,
        ServerMessageObj,
        StickerMessageObj,
        messageDatabase,
        eventTriggerMessageId,
        replyTarget,
        LocationMessageObj,
        TextMessageObj,
        FileMessageObj,
        AudioMessageObj,
        ImageMessageObj,
    } from "$lib/messageTypes";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { chatRoomStore, listenScroll, showScrollPopUp, messageContainer } from "$lib/store.svelte";
    import { showReplyToast } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import { copyText } from "$lib/utils";
    import { onMount, tick } from "svelte";

    import hljs from "highlight.js";
    import { addState } from "../stateManager.svelte";
    import type { LightBoxTargettype } from "$lib/types";
    import { selectedStickerGroup } from "./quickSettingsModal.svelte";

    interface Props {
        lightBoxTarget: LightBoxTargettype | null;
    };

    let { lightBoxTarget = $bindable() }: Props = $props();

    function handleRightClick(e: MouseEvent) {
        e.preventDefault();
        const target: HTMLElement = e.target as HTMLElement;

        
        if (target.closest(".msg")) {
            const id = target.closest(".message")?.id;
            if (!id) {
                return;
            }
            
            if (!messageDatabase.has(id)) {
                return;
            }

            const messageObj = messageDatabase.getMessage(id) as MessageObj;

            if (messageObj?.baseType == 'deleted'){
                return;
            }

            eventTriggerMessageId.set(messageObj.id);
            addState('', { showMessageOptions: true });
        }
    }

    const swipeIconDistance = 40;

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

        node.onclick = (evt) => {
            const target = evt.target as HTMLElement;

            if (target.tagName == "CODE"){
                return;
            }

            const message = target.closest(".message") as HTMLElement;

            if (!message) {
                return;
            }

            if (!messageDatabase.has(message.id)){
                return;
            }

            const messageObj = messageDatabase.getMessage(message.id) as MessageObj;

            if (target.classList.contains('reactsContainer')){
                eventTriggerMessageId.set(messageObj.id);
                addState('', { showReactsOnMessage: true })
                return;
            }

            
            if (messageObj instanceof AudioMessageObj && target.closest('.data')){
                
                if (target.classList.contains('control')){


                    if (messageObj.audio.paused){
                        //stop all other audios
                        if (currentPlayingAudioMessage && currentPlayingAudioMessage.audio.src !== messageObj.audio.src){
                            currentPlayingAudioMessage.audio.pause();
                            currentPlayingAudioMessage.audio.currentTime = 0;
                            currentPlayingAudioMessage.audio.ontimeupdate = null;
                            currentPlayingAudioMessage.audio.onended = null;
                        }

                        currentPlayingAudioMessage = messageObj;

                        messageObj.audio.play().catch((err) => {
                            console.log(err);
                            showToastMessage("Audio data is not loaded yet");
                        });

                        messageObj.audio.ontimeupdate = () => {

                            messageDatabase.update((messages) => {
                                return messages;
                            });
                        }

                        messageObj.audio.onended = () => {
                            messageObj.audio.currentTime = 0;
                            messageObj.audio.onended = null;
                            messageObj.audio.ontimeupdate = null;
                            currentPlayingAudioMessage = null;
                            messageDatabase.update((messages) => {
                                return messages;
                            });
                        }

                    } else if (!messageObj.audio.paused) {
                        messageObj.audio.currentTime = 0;
                        messageObj.audio.pause();
                    }

                    return;
                }

                const progressContainer = target.closest('.progress-container') as HTMLElement;

                if (!messageObj.audio.paused && evt.offsetX < progressContainer.offsetWidth && evt.offsetX > 0) {
                    //if duration is not finite, then set it to 0 and wait for it to be updated
                    if (!isFinite(messageObj.audio.duration)) {
                        showToastMessage('Please wait for the audio to load');
                        return;
                    }
                    //get the calculated time and seek to it
                    const duration = messageObj.audio.duration;
                    const time = (evt.offsetX / progressContainer.offsetWidth) * duration;
                    messageObj.audio.currentTime = time;
                    //seekAudioMessage(audio, time);
				}

                return;
            } else if (messageObj instanceof ImageMessageObj && target.closest('img')){
                addState('view', { showLightBox: true });
                lightBoxTarget = { src: messageObj.url, id: messageObj.id, name: messageObj.name};
            }

            //if message is a sticker, show the sticker panel of that group
            if (target.classList.contains("msg") && messageObj.baseType == "sticker") {

                const stickerGroup = (messageObj as StickerMessageObj).groupName;
                //selectedSticker.set(stickerGroup);
                selectedStickerGroup.set(stickerGroup);
                //showStickersPanel.set(true);
                //pushState('/stickers/'+stickerGroup, { showStickersPanel: true });
                addState("stickers", { showStickersPanel: true });
                return;
            }
            //if message is a reply, scroll to the replied message
            if (target.classList.contains("messageReply")) {

                const messageObj = messageDatabase.getMessage(message.id) as MessageObj;
                const replyId = messageObj.replyTo;
                //scroll to the replied message
                focusMessage(replyId);
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

                if (target.closest(".msg") && messageDatabase.has(message.id) && (messageDatabase.getMessage(message.id) as MessageObj).baseType != 'deleted') {

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
                        const replyIcon = message.querySelector(".replyIcon") as HTMLElement;

                        const { classList, sent } = messageDatabase.getMessage(message.id) as MessageObj;

                        swipeStarted = true;
                        replyIcon.dataset.swipeStart = "true";
                        //if msg is self
                        if (classList.includes("self") && sent) {
                            replyIcon.style.transform = `translateX(${swipeIconDistance}px)`;
                            if (xDiff >= swipeIconDistance) {
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
                            replyIcon.style.transform = `translateX(-${swipeIconDistance}px)`;
                            if (xDiff <= -swipeIconDistance) {
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

        const endHandler = (evt: TouchEvent) => {
            try {

                touchEnded = true;

                if (!swipeStarted){
                    return;
                };

                const target = evt.target as HTMLElement;
                const message = target.closest(".message") as HTMLElement;

                if (target.closest(".msg") && messageDatabase.has(message.id)) {
                    //touchEnded = true;

                    const messageObj = messageDatabase.getMessage(message.id) as MessageObj;

                    const { classList, sent } = messageObj;

                    swipeStarted = false;

                    horizontalSwipe = false;

                    const replyIcon = message.querySelector(".replyIcon",) as HTMLElement;

                    if (classList.includes("self") && sent) {
                        replyIcon.style.transform = `translateX(${swipeIconDistance}px)`;
                    } else {
                        replyIcon.style.transform = `translateX(-${swipeIconDistance}px)`;
                    }
                        
                    replyIcon.dataset.swipeStart = "false";
                    
                    //use spring animation to translate back to 0
                    const x = spring(xDiff, { stiffness: 0.3, damping: 0.8 });
                    unsub = x.subscribe((value) => {
                        message.style.transform = `translateX(${value}px)`;
                    });
                    x.set(0);
                    
                    if (replyTrigger) {

                        replyTarget.set(messageObj);

                        showReplyToast.set(true);

                        replyTrigger = false;
                        replyIcon.dataset.replyTrigger = "false";
                    }
                }
            } catch (e) {
                console.log(e);
            }
        };

        node.ontouchend = endHandler;
        node.ontouchcancel = endHandler;
        
        return {
            destroy() {
                node.ontouchstart = null;
                node.ontouchmove = null;
                node.ontouchend = null;
                node.ontouchcancel = null;
                node.onclick = null;
                if (unsub) unsub();
            },
        };
    }

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
        } catch (err) {
            showToastMessage(`${err}`);
        }
    }
    
    //decimal
    let lastHeight = 0;
    let lastScrollPosition = 0;
    let scrollChanged = 0;
    let heightChanged = 0;
    let scrolledToBottomPx = 0;

    let messagesHTML: HTMLElement;


    onMount(() => {
        hljs.highlightAll();
        //observe the message container for height change
        const observer = new ResizeObserver(() => {
            updateUI();
        });

        messageContainer.value.addEventListener('scroll', () => {
            currentScrollTop = messageContainer.value.scrollTop;
        });

        observer.observe(messagesHTML);

        return () => {
            observer.disconnect();
        }
    });
    // Capture the latest scroll position before making adjustments
    let currentScrollTop = 0;

    function scrollBy(value: number) {

        // Calculate the new target position and set it directly
        let newPosition = currentScrollTop + value;
        messageContainer.value.scrollTop = newPosition; // Rounds to 10 decimal places
    }
    
    export async function updateUI(){
        if (!messageContainer.value){
            return;
        }
        console.log('updating UI');
        messageContainer.value.style.height = 'auto';
        await tick();
        messageContainer.value.style.height = `${messageContainer.value.offsetHeight}px`;
        
        scrolledToBottomPx = messagesHTML.getBoundingClientRect().height - messageContainer.value.scrollTop - messageContainer.value.getBoundingClientRect().height;

        heightChanged = messagesHTML.getBoundingClientRect().height - lastHeight;
        scrollChanged = lastScrollPosition - messageContainer.value.scrollTop;

        console.log('height changed', heightChanged, 'scroll changed', scrollChanged, 'scrolledToBottomPx', scrolledToBottomPx);
        if (Math.abs(heightChanged) < 16){
            if (heightChanged > 0) { //height increase, means the messages under has gone down by around 16px so we need to scroll up that much.
                scrollBy(heightChanged);
                console.log('scrolling up');
            }
            
            else if (heightChanged < 0 && (scrolledToBottomPx > 0 && scrollChanged == 0)){ //height decrease, means the messages under has gone up by around 16px so we need to scroll down that much.
                scrollBy(heightChanged);
                console.log('scrolling down');
            }
            
        } else if (heightChanged > 16 && !showScrollPopUp.value){
            
            listenScroll.value = false;
            
            //if the message is image, wait for it to load
            const lastMessage = messageContainer.value.lastElementChild as HTMLElement;
            if (messageDatabase.has(lastMessage.id)){

                const lastMessageObj = messageDatabase.getMessage(lastMessage.id) as MessageObj;
                
                if (lastMessageObj.type != "sticker"){
                    const img = lastMessage.querySelector('img') as HTMLImageElement;
    
                    if (img &&!img.complete){
                        await new Promise((resolve) => {
                            img.addEventListener('load', () => {
                                resolve(null);
                            }, {once: true});
                        });
                    }
                }
            }
            
            messageContainer.value.scrollTo({
                top: messagesHTML.getBoundingClientRect().height,  // Scroll to the bottom based on scrollHeight
                behavior: "smooth"
            });
            messageContainer.value.addEventListener('scrollend', () => {
                listenScroll.value = true;
            }, {once: true});
        }
        
        lastHeight = messagesHTML.getBoundingClientRect().height;
        lastScrollPosition = messageContainer.value.scrollTop;

        console.log('lastScrollPosition: ', lastScrollPosition)

        //last message
        const lastMessage = messagesHTML.lastElementChild as HTMLElement;

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

        const lastMessageObj = messageDatabase.getMessage(lastMessage.id) as MessageObj;

        if (!lastMessageObj) {
            return;
        }

    }

</script>
<div class="messageContainer" bind:this={messageContainer.value}>
    <ul class="messages" use:handleMessages oncontextmenu={handleRightClick} id="messages" bind:this={messagesHTML} ontouchmove={(e) => {     
            e.preventDefault();
            if (e.target == e.currentTarget){
                e.preventDefault();
            }
        }}>
        <div class="welcome_wrapper" in:fade>
            <div class="welcomeText">
                <img src="/images/greetings/{Math.floor(Math.random() * (9 - 1 + 1)) + 1}.webp" alt="Welcome Sticker" height="160px" width="160px" id="welcomeSticker" />
                <div>Share this chat link to others to join</div>
                <button id="invite" class="clickable hover play-sound button capsule" title="Click to share" onclick={invite}>
                    Share
                    <i class="fa-solid fa-share-nodes"></i>
                </button>
            </div>
        </div>
        {#each $messageDatabase as message (message)}
    
            {#if message instanceof MessageObj}
                
                {#if message instanceof TextMessageObj && (message.type === "text" || message.type === "emoji")}
                    <TextMessage message={message} />
                {:else if message instanceof StickerMessageObj}
                    <StickerMessage message={message}/>
                {:else if message instanceof AudioMessageObj}
                    <AudioMessage file={message}/>
                {:else if message instanceof FileMessageObj}
                    <FileMessage file={message}/>
                {:else if message instanceof TextMessageObj && message.type === "deleted"}
                    <DeletedMessage message={message}/>
                {/if}
    
            {:else if message instanceof ServerMessageObj}
                <ServerMessage message={message} />
            {:else if message instanceof LocationMessageObj}
                <LocationMessage location={message}/>
            {/if}
        {/each}
    </ul>
</div>

<style lang="scss">

        .messageContainer{
            height: auto;
            overflow-y: scroll;
            overflow-x: hidden;
            scrollbar-width: none;
        }

        #messages {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 2px;
            color: var(--text-color);
            list-style: none;
            z-index: 1;
            padding-bottom: 5px;
            //scroll-snap-type: y proximity;
            overscroll-behavior: none;
            width: 100%;

            .welcome_wrapper {
                display: grid;
                place-content: center;
                opacity: 1;
                visibility: visible;
                //margin: auto 0;
                min-height: max(85vh, 500px);

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
                        color: var(--text-color);
                    }
                }
            }
        }
</style>