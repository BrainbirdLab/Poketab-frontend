<script lang="ts">
    import "$lib/components/messages/message.scss";
    import MessageInput from "./chatComponents/messageInput.svelte";
    import TextMessage from "$lib/components/messages/TextMessage.svelte";
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
    } from "$lib/messages";
    import { showToastMessage } from "$lib/components/toast";
    import SidePanel from "./chatComponents/sidePanel.svelte";
    import { fade, fly } from "svelte/transition";
    import QuickSettings from "./chatComponents/quickSettings.svelte";
    import TypingIndicator from "$lib/components/chatUI/chatComponents/typingIndicator.svelte";
    import { chatRoomStore, selfInfoStore, userTypingString } from "$lib/store";
    import {
        activeModalsStack,
        selectedSticker,
        showAttachmentPickerPanel,
        showMessageOptions,
        showQuickSettingsPanel,
        showSidePanel,
        showStickersPanel,
        showThemesPanel,
    } from "$lib/components/modalManager";
    import ConnectivityState from "./chatComponents/connectivityState.svelte";
    import Themes from "./chatComponents/themes.svelte";
    import { afterUpdate, onDestroy, onMount } from "svelte";
    import StickersKeyboard from "./chatComponents/stickersKeyboard.svelte";
    import Attachments from "./chatComponents/attachments.svelte";
    import MessageOptions from "./chatComponents/messageOptions.svelte";
    import StickerMessage from "$lib/components/messages/stickerMessage.svelte";
    import ServerMessage from "$lib/components/messages/serverMessage.svelte";
    import { socket } from "$lib/components/socket";
    import { spring } from "svelte/motion";
    import MessageReplyToast from "./chatComponents/messageReplyToast.svelte";
    import ScrollDownPopup from "./chatComponents/scrollDownPopup.svelte";
    import { filterBadWords, getFormattedDate, makeClasslist, showReplyToast } from "$lib/components/messages/messageUtils";
    import DeletedMessage from "$lib/components/messages/deletedMessage.svelte";
    import LocationMessage from "$lib/components/messages/locationMessage.svelte";
    import NavBar from "./chatComponents/navbar.svelte";
    import { Prism } from "$lib/prism/prism.min";

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

    let messages: HTMLElement;

    let timeStampInterval: NodeJS.Timeout | null = null;

    afterUpdate(() => {

        if (messages &&
            messages.offsetHeight + messages.scrollTop >
                messages.scrollHeight - 200) {
            messages.scrollTop = messages.scrollHeight;
        }

        //last message
        const lastMessage = messages.lastElementChild as HTMLElement;

        if (!lastMessage.classList.contains("message")) {
            return;
        }

        const lastMessageObj = $messageDatabase.get(lastMessage.id) as MessageObj;

        if (!lastMessageObj) {
            return;
        }

        Prism.highlightAll();

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
    });

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
    };

    const userTypingSet = new Set<string>();

    let notice: MessageObj | null = null;

    socket.on("newMessage", (message: MessageObj, messageId: string) => {
        //console.log(message);

        if(message.kind == 'text'){
            message = Object.setPrototypeOf(message, TextMessageObj.prototype);
        } else if (message.kind == 'sticker'){
            message = Object.setPrototypeOf(message, StickerMessageObj.prototype);
        } else if (message.kind == 'deleted'){
            message = Object.setPrototypeOf(message, TextMessageObj.prototype);
        } else if (message.kind == 'location'){
            message = Object.setPrototypeOf(message, LocationMessageObj.prototype);
        }

        if (message instanceof TextMessageObj){
            message.message = filterBadWords(message.message);
        }

        messageDatabase.update((messages) => {
            message.classList = makeClasslist(message);
            message.sent = true;
            messages.set(messageId, message);
            return messages;
        });

        lastMessageId.set(messageId);
        notice = message;
    });

    socket.on('linkPreviewData', (messageId: string, data: {title: string, description: string, image: string, url: string}) => {
        if (!$messageDatabase.has(messageId)){
            return;
        }

        console.log('link preview data received');
        console.log(data);
        
        messageDatabase.update((messages) => {
            const message = messages.get(messageId) as MessageObj;
            console.log(message.kind);
            console.log(message instanceof TextMessageObj);
            if (message && message instanceof TextMessageObj){
                console.log('updating link preview data');
                message.linkPreviewData = data;
            }
            return messages;
        });
    });

    socket.on('deleteMessage', (messageId: string, uid: string) => {

        try{
            
            if (!$messageDatabase.has(messageId)){
                return;
            }

            let message = $messageDatabase.get(messageId) as TextMessageObj;

            if (message.sender == uid){
                if (!(message instanceof TextMessageObj)){
                    message = Object.setPrototypeOf(message, TextMessageObj.prototype);
                }
                message.message = 'This message was deleted';
                message.kind = 'deleted';
                message.type = 'deleted';
                message.replyTo = '';
                messageDatabase.update((messages) => {
                    //change the message to "This message was deleted"
                    messages.set(messageId, message);
                    return messages;
                });

                const navbar = document.querySelector('.navbar') as HTMLElement;
                const footer = document.querySelector('.footer') as HTMLElement;
                messages.style.height = `calc(100vh - ${navbar.offsetHeight + footer.offsetHeight}px)`;
            }
        } catch (e){
            console.log(e);
        }
    });

    socket.on('location', (coord: {latitude: number, longitude: number}, id: string, uid: string) => {
        
        if (!$chatRoomStore.userList[uid]){
            return;
        }

        messageDatabase.update((messages) => {
            const message = new LocationMessageObj(coord.latitude, coord.longitude, uid);

            messages.set(id, message);

            return messages;
        });
    });

    socket.on("server_message", (msg: { text: string; id: string }, type: string) => {
            //console.log(msg);

            messageDatabase.update((messages) => {
                const message: ServerMessageObj = new ServerMessageObj();
                message.text = msg.text;
                message.type = type;

                messages.set(msg.id, message);

                return messages;
            });
        },
    );

    socket.on("react", (messageId: string, uid: string, react: string) => {
        console.log("react received");
        messageDatabase.update((messages) => {
            const message = messages.get(messageId) as MessageObj;
            console.log(message);
            if (message && message instanceof MessageObj) {
                //if same react is clicked again, remove it
                if (message.reactedBy[uid] == react) {
                    //message.reactedBy.delete(uid);
                    delete message.reactedBy[uid];
                } else {
                    //message.reactedBy.set(uid, react);
                    message.reactedBy[uid] = react;
                }
            }
            return messages;
        });
    });

    socket.on("seen", (uid: string, messageId: string) => {
        if (!uid || !messageId || !$chatRoomStore || !$chatRoomStore.userList[uid]) {
            //console.log("invalid seen");
            return;
        }

        chatRoomStore.update((chatRoom) => {
            chatRoom.userList[uid].lastSeenMessage = messageId;
            return chatRoom;
        });

        messageDatabase.update((messages) => {
            const message = messages.get(messageId) as MessageObj;

            if (message && message instanceof MessageObj) {
                message.seenBy[uid] = true;
            }

            return messages;
        });
    });

    socket.on("typing", (uid: string, event: "start" | "end") => {
        if (event == "start") {
            userTypingSet.add(uid);
        } else {
            userTypingSet.delete(uid);
        }

        if (userTypingSet.size > 0) {
            // 1 person typing: 'Alex is typing'
            // 2 people typing: 'Alex and max is typing'
            // 3 people typing: 'Alex, max and 1 other is typing'
            // 4 people typing: 'Alex, max and length-2 others are typing'
            const userIdArray = Array.from(userTypingSet);

            switch (userTypingSet.size) {
                case 1:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.name
                        } is typing`,
                    );
                    break;
                case 2:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.name
                        } and ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.name
                        } are typing`,
                    );
                    break;
                case 3:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.name
                        }, ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.name
                        } and 1 other are typing`,
                    );
                    break;
                default:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.name
                        }, ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.name
                        } and ${userTypingSet.size - 2} others are typing`,
                    );
                    break;
            }
        } else {
            userTypingString.set("");
        }
    });

    onMount(() => {
        //make a system where you can push and pop modals from the stack
        //when a modal or panel is opened, push it to the stack
        //when a new modal or panel is opened, push it to the stack
        //when a modal or panel is closed, pop it from the stack
        //when esc is pressed, pop the top modal or panel from the stack
        document.onkeydown = keyBindingHandler;

        window.onfocus = () => {
            if (!$lastMessageId) {
                //console.log('No last seen message');
                return;
            }

            //console.log(`Seen last message ${($messageDatabase.get($lastSeenMessage) as MessageObj).message} by ${$selfInfoStore.name}`);
            socket.emit("seen", $selfInfoStore.uid, $lastMessageId);
        };
    });

    onDestroy(() => {
        document.onkeydown = null;
        window.onfocus = null;
        messages.onscroll = null;
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
        messages = node as HTMLElement;

        //on horizontal scroll on a single message, move the message to swipe reply
        let xStart = 0;
        let yStart = 0;
        let xDiff = 0;
        let yDiff = 0;
        let horizontalSwipe = false;
        let touchEnded = true;
        let swipeStarted = false;
        let replyTrigger = false;

        messages.onclick = (evt) => {
            const target = evt.target as HTMLElement;

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
                time.classList.toggle("active");

                if (messageObj.timeout) {
                    clearTimeout(messageObj.timeout);
                }

                messageObj.timeout = setTimeout(() => {
                    time.classList.remove("active");
                }, 1500);
            }

            //if message is a sticker, show the sticker panel of that group
            if (target.classList.contains("msg") && messageObj.kind == "sticker") {

                const stickerGroup = (messageObj as StickerMessageObj).groupName;
                selectedSticker.set(stickerGroup);
                showStickersPanel.set(true);

            }
            //if message is a reply, scroll to the replied message
            else if (target.classList.contains("messageReply")) {

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
                        //remove highlight after 2 seconds
                        setTimeout(() => {
                            replyMessage.classList.remove("highlight");
                        }, 1000);
                    }
                }
            }
        };

        // Listen for a swipe on left
        messages.ontouchstart = (evt) => {
            const target = evt.target as HTMLElement;
            if (target.closest(".message")) {
                xStart = evt.touches[0].clientX / 3;
                yStart = evt.touches[0].clientY / 3;
            }
        };

        messages.ontouchmove = (evt) => {
            try {
                const target = evt.target as HTMLElement;
                const message = target.closest(".message") as HTMLElement;

                if (target.closest(".msg") && $messageDatabase.has(message.id)) {
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

        messages.ontouchend = (evt) => {
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
                messages.ontouchstart = null;
                messages.ontouchmove = null;
                messages.ontouchend = null;
                messages.onclick = null;
                if (unsub) unsub();
            },
        };
    }
</script>

<svelte:head>
    <title>Poketab - Chat</title>
</svelte:head>

<SidePanel />
<QuickSettings />
<Themes />
<StickersKeyboard />
<Attachments />
<ConnectivityState bind:offline={isOffline} />
<MessageOptions />

<div class="container">
    <div class="chatBox" class:offl={isOffline}>
        <NavBar />
        <ul class="messages" use:handleMessages on:contextmenu={handleRightClick} id="messages" bind:this={messages}>
            <div class="welcome_wrapper" in:fly={{ x: -50 }} out:fade={{ duration: 100 }} >
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
        <ScrollDownPopup messageContainer={messages} bind:notice={notice}/>
        <TypingIndicator />
        <MessageReplyToast />
        <MessageInput />
    </div>
</div>

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
            scroll-behavior: smooth;
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

    @media screen and (orientation: landscape) and (min-device-aspect-ratio: 1.5 / 1) {
        .chatBox {
            width: 50%;
            min-width: 450px;
        }
    }
</style>
