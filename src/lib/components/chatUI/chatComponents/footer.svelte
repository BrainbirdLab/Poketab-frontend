<script lang="ts">
    import { page } from "$app/state";
    import { TextMessageObj, AudioMessageObj, MessageObj, eventTriggerMessageId, replyTarget, editMessageTarget } from "$lib/messageStore.svelte";
    import { sendMessage, isEmoji, emojiParser, filterBadWords, showReplyToast, editMessage, TextParser, escapeXSS, sendEditedMessage } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import Recorder from "./voiceRecorder.svelte";
    import { fly } from "svelte/transition";
    import { socket } from "$lib/connection/socketClient";

    import { myId, chatRoomStore, messageContainer, messageScrolledPx } from "$lib/store.svelte";
    import { quickEmoji, quickEmojiEnabled, sendMethod } from "$lib/settings.svelte";
    import { SEND_METHOD } from "$lib/types";
    import { onDestroy, onMount } from "svelte";
    import MessageReplyToast from "./messageReplyToast.svelte";
    import ScrollDownPopup from "./notify.svelte";
    import { addState } from "../stateManager.svelte";
    import MessageSockets from "../messageSockets.svelte";
    import { getPlainText } from "$lib/utils";

    let newMessage = $state('');

    let recorder = $state() as ReturnType<typeof Recorder>;

    let recordedAudioUrl = $state('');
    let recorderIsActive = $state(false);

    const codeParser = new TextParser();
    
    async function insertMessage(Emoji = false){

        let message: MessageObj;
        let file: File | undefined;

        if (recordedAudioUrl.length !== 0){

            message = new AudioMessageObj();

            const name = `${chatRoomStore.value.userList[myId.value].avatar}'s voice message`;

            if (message instanceof AudioMessageObj){
                message.url = recordedAudioUrl;
                message.audio.src = message.url;
                message.type = 'audio/mpeg';
                message.duration = recorder.getDuration();
                message.name = name;
                message.loadScheme = 'upload';
                file = await fetch(message.url).then(res => res.blob()).then(blob => new File([blob], name, {type: 'audio/mpeg'}));
            }

            recorder.closeRecorder(false);

        } else {
            inputbox.style.height = 'min-content';
    
            message = new TextMessageObj();
    
            if (!Emoji && newMessage.trim() === ''){
                return;
            }
            
            newMessage = escapeXSS(filterBadWords(emojiParser(newMessage)));
    
            if (Emoji){
                newMessage = quickEmojiEnabled.value ? quickEmoji.value : '';
                message.type = 'emoji';
                message.baseType = 'text';
            } else if (isEmoji(newMessage)) {
                message.type = 'emoji';
                message.baseType = 'text';
            } else {
                message.type = 'text';
                message.baseType = 'text';
                newMessage = codeParser.parse(newMessage);
            }

            if (message instanceof TextMessageObj){
                message.message = newMessage.trim();
                newMessage = '';
            }
        }

        if (replyTarget.value){
            message.replyTo = replyTarget.value.id;
            eventTriggerMessageId.value = "";
            replyTarget.value = null;
            showReplyToast.value = false;
        }

        await sendMessage(message, file);

        endTypingStatus();
    }

    //if text contains only whitespace characters then return true
    function isWhitespace(text: string) {
        //convert <br> to whitespace
        return !/[^\s]/.test(text);
    }

    let isTypingTimeout: number | NodeJS.Timeout;

    let lastTypingStatusSent = $state(0);

    function sendTypingStatus(){

        if (Date.now() - lastTypingStatusSent < 1500) {
            return; // Prevent sending typing status too frequently
        }

        socket.emit('typing', myId.value, chatRoomStore.value.Key, 'start');

        lastTypingStatusSent = Date.now();

        if (isTypingTimeout) {
            clearTimeout(isTypingTimeout);
        };

        isTypingTimeout = setTimeout(() => {
            endTypingStatus();
        }, 1500);
    }

    function endTypingStatus(){
        socket.emit('typing', myId.value, chatRoomStore.value.Key, 'end');
    }

    const inputHandler = (e: Event) => {
        updateTextareaHeight();
        sendTypingStatus();
    };

    function updateTextareaHeight() {

        if (isWhitespace(inputbox.innerText)) {
            inputbox.innerText = '';
        }

        const clone = inputbox.cloneNode(true) as HTMLDivElement;
        clone.style.width = inputbox.offsetWidth + 'px';
        clone.style.height = 'auto';
        clone.style.zIndex = '-99999';
        clone.style.visibility = 'hidden';

        inputbox.after(clone);

        const height = clone.offsetHeight;

        inputbox.style.height = height + 'px';

        clone.remove();
    }

    function keyDownHandler(e: KeyboardEvent){

        if (sendMethod.value == SEND_METHOD.ENTER && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            editMessage.value ? editMessageApply() : insertMessage();
        } else if (sendMethod.value == SEND_METHOD.CTRL_ENTER && e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            editMessage.value ? editMessageApply() : insertMessage();
        }
    }

    let inputbox = $state() as HTMLDivElement;

    const unsub = showReplyToast.onChange(val => {
        if (val) {
            inputbox.focus();
        }
    });

    const unsub2 = editMessage.onChange(val => {
        if (val) {
            inputbox.focus();
        }
    });

    let footer = $state() as HTMLDivElement;
    let observer: ResizeObserver;

    let lastHeight = 0;

    let maxWindowHeight: number;
    let softKeyboardActive = false;

    function keyboardActivationWatcher(){
        softKeyboardActive = (window.visualViewport?.height || 0) < maxWindowHeight;
    }

    onMount(() => {

        maxWindowHeight = window.visualViewport?.height || 0;

        window.addEventListener('resize', keyboardActivationWatcher);

        //on height change
        observer = new ResizeObserver(entries => {
            for (let entry of entries) {

                //skip if entry height is decreasing
                if (entry.contentRect.height < lastHeight){
                    lastHeight = entry.contentRect.height;
                    messageContainer.value.style.height = messageContainer.value.scrollHeight + 'px';
                    return;
                }

                lastHeight = entry.contentRect.height;

                if (messageScrolledPx.value < 200){
                    messageContainer.value.scrollTo({top: messageContainer.value.scrollHeight});
                }
            }
        });

        inputbox.onblur = () => {
            if (softKeyboardActive) {
                inputbox.focus();
            }
        };

        observer.observe(footer);
    });

    onDestroy(() => {
        unsub();
        unsub2();
        observer.disconnect();
        window.removeEventListener('resize', keyboardActivationWatcher);
    });

    $effect(() => {
        if (editMessage.value ) {
            newMessage = getPlainText(editMessageTarget.value);

            //set the cursor to the end of the input box
            setTimeout(() => {
                inputbox.focus();
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(inputbox);
                range.collapse(false);
                sel?.removeAllRanges();
                sel?.addRange(range);
            }, 0);
        }
    });

    function editMessageApply() {

        if (!editMessageTarget.value || !editMessageTarget.value.id) {
            return;
        }

        //copy the message to a new object to avoid mutating the original message
        const message = new TextMessageObj();
        message.message = escapeXSS(filterBadWords(emojiParser(newMessage)));
        message.id = editMessageTarget.value.id;

        sendEditedMessage(message);
        
        editMessage.value = false;
        editMessageTarget.value = null;
        newMessage = '';
    }

    let inputOff = $derived(page.state.showStickersPanel || page.state.showAttachmentPickerPanel);

</script>

<div class="footer" transition:fly={{y: 30}} bind:this={footer} ontouchmove={(e) => {e.preventDefault(), e.stopPropagation()}}>

    <ScrollDownPopup/>
    <MessageSockets />

    <div class="chatInput" class:hide={inputOff == true}>
        <button aria-label="add stickers" disabled={editMessage.value} onclick={() => {
                addState("stickers", { showStickersPanel: true });
            }}
            class="button-animate play-sound inputBtn roundedBtn hover hoverShadow" title="Choose stickers [Alt+i]"><i class="fa-solid fa-face-laugh-wink"></i></button>
        <button aria-label="add attachments" disabled={editMessage.value} onclick={() => {
            addState("attachments", { showAttachmentPickerPanel: true });
        }} class="button-animate play-sound inputBtn roundedBtn hover hoverShadow" title="Send attachment [Alt+a]"><i class="fa-solid fa-paperclip"></i></button>
        <!-- Text input -->
        <div class="inputField">
            {#if showReplyToast.value && replyTarget.value && replyTarget.value.id}
                <MessageReplyToast purpose={"reply"}/>
            {:else if editMessage.value && editMessageTarget.value && editMessageTarget.value.id}
                <MessageReplyToast purpose={"edit"}/>
            {/if}
            <div class="textbox-wrapper">
                <div style:opacity={recorderIsActive ? 0 : 1} onpaste={updateTextareaHeight} role="textbox" oninput={inputHandler} onkeydown={keyDownHandler} bind:this={inputbox} id="textbox" bind:innerText={newMessage} contenteditable="true" class="select" data-placeholder="Message..." tabindex="0" enterkeyhint="{sendMethod.value == SEND_METHOD.ENTER ? "send" : "enter"}"></div>
                <Recorder bind:this={recorder} bind:recordedAudioUrl={recordedAudioUrl} bind:recorderIsActive={recorderIsActive}/>
            </div>
        </div>
        <!-- Send Button-->
        {#if editMessage.value}
            <!-- Edit mode -->
            <button aria-label="edit" id="send" onclick={editMessageApply} class="inputBtn button-animate roundedBtn hover hoverShadow" title="Enter to edit message" tabindex="-1" data-role="send">
                {#if newMessage.trim() == '' || newMessage == editMessageTarget.value?.message}
                    <i class="fa-regular fa-circle-check sendIcon"></i>
                {:else}
                    <i class="fa-solid fa-circle-check sendIcon"></i>
                {/if}
            </button>
        {:else}
            {#if quickEmojiEnabled.value && newMessage.trim().length === 0 && !recordedAudioUrl}
                <button id="send" onclick={() => {insertMessage(true)}} class="quickEmoji inputBtn button-animate roundedBtn hover hoverShadow" title="Enter to send {quickEmoji.value}" tabindex="-1" data-role="send">{quickEmoji.value}</button>
            {:else}
                <button aria-label="send" id="send" onclick={() => {insertMessage()}} class="inputBtn button-animate roundedBtn hover hoverShadow" title="Enter to send message" tabindex="-1" data-role="send"><i class="fa-solid fa-paper-plane sendIcon"></i></button>
            {/if}
        {/if}
    </div>
</div>

<style lang="scss">

    .footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        transition: 300ms ease-in-out;
        bottom: 0px;
        padding-bottom: 10px;
        position: relative;
        z-index: 1;
        overscroll-behavior: none;
    }

    .chatInput{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-end;
        position: relative;
        padding: 0 3px;
        gap: 2px;
        width: 100%;
        transition: 200ms ease-in-out;


        &.hide {
            visibility: hidden;
            opacity: 0;
            transform: translateY(70%);
        }

        #send {
            border: none;
            position: relative;
            background: transparent;
            margin: 5px;
        }

        .quickEmoji, .sendIcon{
            animation: pop 300ms ease-in-out forwards;
        }

        .quickEmoji{
            font-size: 1.8rem;
        }

        .inputBtn {
            margin-bottom: 5px;
        }

        .inputField {
            margin: 0;
            border-radius: 25px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            width: 100%;
            background: var(--glass-color);
            border-radius: 24px;
            transition: 300ms;
            
            backdrop-filter: blur(5px);
            
            .textbox-wrapper {
                position: relative;
                width: 100%;
                padding: 5px 40px 5px 20px;
                overflow: hidden;
                min-height: 45px;
                transition: height 150ms ease-in-out;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                
                #textbox {
                    
                    position: relative;
                    width: 100%;
                    outline:none;
                    resize: none;
                    overflow-y: auto;
                    max-height: 8rem;
                    line-height: 1.4rem;
                    font-size: 0.8rem;
                    transition: height 150ms ease-in-out, opacity 150ms ease-in-out;
                    text-align: left;

                    &::before {
                        content: attr(data-placeholder);
                        color: var(--transparent-white-color);
                        font-size: 0.9rem;
                        position: absolute;
                        opacity: 1;
                        visibility: visible;
                        pointer-events: none;
                        transition: 150ms ease-in-out;
                    }

                    //hide placeholder when text is entered
                    &:not(:empty)::before {
                        opacity: 0;
                        transform: translate(10px, 0);
                    }
                }
            }
        }

    }
</style>