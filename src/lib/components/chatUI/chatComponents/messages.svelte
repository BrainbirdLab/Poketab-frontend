<script context="module" lang="ts">
    let currentPlayingAudioMessage: AudioMessageObj | null = null;
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
        messageContainer,
        FileMessageObj,
        AudioMessageObj,
    } from "$lib/messageTypes";
    import {
        selectedSticker,
        showMessageOptions,
        showReactsOnMessageModal,
        showStickersPanel,
    } from "$lib/components/modalManager";
    import { showToastMessage } from "domtoastmessage";
    import { chatRoomStore, listenScroll, showScrollPopUp } from "$lib/store";
    import { getFormattedDate, showReplyToast } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import { copyText } from "$lib/utils";
    import { afterUpdate, beforeUpdate, onDestroy, onMount, tick } from "svelte";

    import hljs from "highlight.js";
    import type { Unsubscriber } from "svelte/store";


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

            if (!messageDatabase.has(message.id)){
                return;
            }

            const messageObj = messageDatabase.getMessage(message.id) as MessageObj;

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
                eventTriggerMessageId.set(messageObj.id);
                showReactsOnMessageModal.set(true);
                return;
            }

            
            if (messageObj instanceof AudioMessageObj && target.closest('.data')){
                
                if (target.classList.contains('control')){

                    //console.log(messageObj.audio.paused ? 'Playing...' : 'Paused');
                    
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

                    } else if (!messageObj.audio.paused && target.classList.contains('fa-stop')) {
                        messageObj.audio.currentTime = 0;
                        messageObj.audio.pause();
                    } else if (!messageObj.audio.paused && !messageObj.audio.ended){
                        messageObj.audio.pause();
                    }

                    return;
                }

                const audioContainer = target.closest('.data') as HTMLElement;

                if (!messageObj.audio.paused && evt.offsetX < audioContainer.offsetWidth && evt.offsetX > 0) {
                    //if duration is not finite, then set it to 0 and wait for it to be updated
                    if (!isFinite(messageObj.audio.duration)) {
                        showToastMessage('Please wait for the audio to load');
                        return;
                    }
                    //get the calculated time and seek to it
                    const duration = messageObj.audio.duration;
                    const time = (evt.offsetX / audioContainer.offsetWidth) * duration;
                    //console.log(time);
                    messageObj.audio.currentTime = time;
                    //seekAudioMessage(audio, time);
				}

                return;
            }

            //if message is a sticker, show the sticker panel of that group
            if (target.classList.contains("msg") && messageObj.baseType == "sticker") {

                const stickerGroup = (messageObj as StickerMessageObj).groupName;
                selectedSticker.set(stickerGroup);
                showStickersPanel.set(true);
                return;
            }
            //if message is a reply, scroll to the replied message
            if (target.classList.contains("messageReply")) {

                const messageObj = messageDatabase.getMessage(message.id) as MessageObj;
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

                if (target.closest(".msg") && messageDatabase.has(message.id) && (messageDatabase.getMessage(message.id) as MessageObj).baseType != 'deleted') {
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

                        const { classList, sent } = messageDatabase.getMessage(message.id) as MessageObj;

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

                if (target.closest(".msg") && messageDatabase.has(message.id)) {
                    touchEnded = true;

                    const messageObj = messageDatabase.getMessage(message.id) as MessageObj;

                    const { classList, sent } = messageObj;

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

    let unsubMessageDatabase: Unsubscriber;
    
    let lastHeight = 0;
    let timeStampInterval: number | null = null;
    let heightChanged = 0;
    let scrolledToBottomPx = 0;

    let timeout: number | null = null;

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

    onMount(() => {
        unsubMessageDatabase = messageDatabase.subscribe(updateUI);
        hljs.highlightAll();
    });

    onDestroy(() => {
        if (unsubMessageDatabase){
            unsubMessageDatabase();
        }
    });

    async function updateUI(){

        //console.log('updateUI');

        await tick();

        if (!$messageContainer){
            return;
        }

        if (timeout){
            clearTimeout(timeout);
        }

        //console.log(heightChanged);

        if (Math.abs(heightChanged) < 16){
            if (heightChanged > 0) { //height increase
                $messageContainer.scrollTop += heightChanged;
                //console.log('%cScrolled Up', 'color: orange;');
            }
            /*
            else if (heightChanged < 0 && scrolledToBottomPx > 0){ //height decrease
                console.log('%cScrolled Down', 'color: pink;');
                $messageContainer.scrollTop += heightChanged;
            }
            */
        } else if (heightChanged > 16 && !$showScrollPopUp){
            //console.log('%cSmooth scroll', 'color: lime;');
            
            listenScroll.set(false);

            //if the message is image, wait for it to load
            const lastMessage = $messageContainer.lastElementChild as HTMLElement;
            if (messageDatabase.has(lastMessage.id) && lastMessage.querySelector('img')){

                await new Promise((resolve) => {
                    const img = lastMessage.querySelector('img') as HTMLImageElement;
                    img.addEventListener('load', () => {
                        resolve(null);
                    }, {once: true});
                });
            }
            
            $messageContainer.scrollTo({
                top: $messageContainer.scrollHeight,
                behavior: "smooth",
            });

            $messageContainer.addEventListener('scrollend', () => {
                //console.log('scroll end');
                listenScroll.set(true);
            }, {once: true});
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

        const lastMessageObj = messageDatabase.getMessage(lastMessage.id) as MessageObj;

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

</script>

<ul class="messages" use:handleMessages on:contextmenu={handleRightClick} id="messages" bind:this={$messageContainer}>
    <div class="welcome_wrapper" in:fade>
        <li class="welcomeText">
            <img src="/images/greetings/{Math.floor(Math.random() * (9 - 1 + 1)) + 1}.webp" alt="Welcome Sticker" height="160px" width="160px" id="welcomeSticker" />
            <div>Share this chat link to others to join</div>
            <button id="invite" class="clickable hover play-sound button capsule" title="Click to share" on:click={invite}>
                Share
                <i class="fa-solid fa-share-nodes"></i>
            </button>
        </li>
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

<style lang="scss">
        #messages {
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 2px;
            overflow-y: scroll;
            overflow-x: hidden;
            color: var(--text-color);
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
</style>