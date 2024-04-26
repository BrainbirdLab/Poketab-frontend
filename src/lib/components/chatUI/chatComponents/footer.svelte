<script lang="ts">
    import { replyTarget, eventTriggerMessageId, TextMessageObj, messageScrolledPx, messageContainer, voiceMessageAudio, AudioMessageObj, MessageObj } from "$lib/messageTypes";
    import { sendMessage, isEmoji, emojiParser, filterBadWords, showReplyToast, TextParser, escapeXSS } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import Recorder from "./voiceRecorder.svelte";
    import { fly } from "svelte/transition";
    import { socket } from "$lib/socket";

    import { quickEmojiEnabled, myId, sendMethod, chatRoomStore, quickEmoji} from "$lib/store";
    import { SEND_METHOD } from "$lib/types";
    import { onDestroy, onMount } from "svelte";
    import MessageReplyToast from "./messageReplyToast.svelte";
    import ScrollDownPopup from "./scrollDownPopup.svelte";
    import TypingIndicator from "./typingIndicator.svelte";
    import { addState } from "../stateManager.svelte";
    
    let newMessage = '';

    let recorder: Recorder;
    let recorderIsActive = false;

    const codeParser = new TextParser();
    
    function insertMessage(quickEmoji = false){


        let message: MessageObj;

        if ($voiceMessageAudio){

            message = new AudioMessageObj();

            if (message instanceof AudioMessageObj){
                message.url = $voiceMessageAudio.src;
                message.audio.src = message.url;
                message.type = 'audio/mpeg';
                message.duration = recorder.getDuration();
                message.name = `${$chatRoomStore.userList[$myId].avatar}'s voice message`;
            }

            recorder.closeRecorder();

        } else {
            inputbox.style.height = 'min-content';
    
            message = new TextMessageObj();
    
            if (!quickEmoji && newMessage.trim() === ''){
                return;
            }
            
            newMessage = escapeXSS(filterBadWords(emojiParser(newMessage)));
    
            if (quickEmoji){
                newMessage = $quickEmojiEnabled ? $quickEmoji : '';
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

        if ($replyTarget){
            message.replyTo = $replyTarget.id;
            eventTriggerMessageId.set("");
            replyTarget.set(null);
            showReplyToast.set(false);
        }

        sendMessage(message);

        endTypingStatus();

        setTimeout(() => {
            inputbox.focus();
        }, 100);
    }

    //if text contains only whitespace characters then return true
    function isWhitespace(text: string) {
        //convert <br> to whitespace
        return !/[^\s]/.test(text);
    }

    let isTypingTimeout: number;

    function sendTypingStatus(){
        socket.emit('typing', $myId, $chatRoomStore.Key, 'start');

        if (isTypingTimeout) {
            clearTimeout(isTypingTimeout)
        };

        isTypingTimeout = setTimeout(() => {
            endTypingStatus();
        }, 10000);
    }

    function endTypingStatus(){
        socket.emit('typing', $myId, $chatRoomStore.Key, 'end');
    }

    const inputHandler = (e: Event) => {

        updateTextareaHeight();
        
        //userTypingString.set('You are typing');
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

        if ($sendMethod == SEND_METHOD.ENTER && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            insertMessage();
        } else if ($sendMethod == SEND_METHOD.CTRL_ENTER && e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            insertMessage();
        }
    }

    let inputbox: HTMLDivElement;

    const unsub = showReplyToast.subscribe(val => {
        if (val) {
            inputbox.focus();
        }
    });

    let footer: HTMLDivElement;
    let observer: ResizeObserver;

    let lastHeight = 0;

    onMount(() => {

        //on height change
        observer = new ResizeObserver(entries => {
            for (let entry of entries) {

                //skip if entry height is decreasing
                if (entry.contentRect.height < lastHeight){
                    lastHeight = entry.contentRect.height;
                    $messageContainer.style.height = $messageContainer.scrollHeight + 'px';
                    //console.log('Height decreased');
                    return;
                }

                lastHeight = entry.contentRect.height;

                if ($messageScrolledPx < 200){
                    $messageContainer.scrollTo({top: $messageContainer.scrollHeight});
                    //console.log('Scrolled due to footer update');
                }
            }
        });

        observer.observe(footer);
    });

    onDestroy(() => {
        unsub();
        observer.disconnect();
    });



</script>

<div class="footer" transition:fly={{y: 30}} bind:this={footer}>

    <ScrollDownPopup/>
    
    <TypingIndicator />

    
    <div class="chatInput">
        <button on:click={() => {
                //showStickersPanel.set(true)
                //pushState('/stickers/'+$selectedSticker, { showStickersPanel: true })
                addState("stickers", { showStickersPanel: true });
            }} 
            class="button-animate play-sound inputBtn roundedBtn hover hoverShadow" title="Choose stickers [Alt+i]"><i class="fa-solid fa-face-laugh-wink"></i></button>
        
        <button on:click={() => {
            //pushState('/attachments', { showAttachmentPickerPanel: true });
            addState("attachments", { showAttachmentPickerPanel: true });
        }} class="button-animate play-sound inputBtn roundedBtn hover hoverShadow" title="Send attachment [Alt+a]"><i class="fa-solid fa-paperclip"></i></button>
        <!-- Text input -->
        <div class="inputField">
            {#if $showReplyToast && $replyTarget && $replyTarget.id}
                <MessageReplyToast />
            {/if}
            <div class="textbox-wrapper">
                <div style:opacity={recorderIsActive ? 0 : 1} on:paste={updateTextareaHeight} role="textbox" on:input={inputHandler} on:keydown={keyDownHandler} bind:this={inputbox} id="textbox" bind:innerText={newMessage} contenteditable="true" class="select" data-placeholder="Message..." tabindex="0" enterkeyhint="{$sendMethod == SEND_METHOD.ENTER ? "enter" : "send"}"></div>
                <Recorder bind:this={recorder} bind:isActive={recorderIsActive}/>
            </div>
        </div>
        <!-- Send Button-->
        {#if $quickEmojiEnabled && newMessage.trim().length === 0 && !$voiceMessageAudio}
            <button id="send" on:click={() => {insertMessage(true)}} class="quickEmoji inputBtn button-animate roundedBtn hover hoverShadow" title="Enter to send {$quickEmoji}" tabindex="-1" data-role="send">{$quickEmoji}</button>
        {:else}
            <button id="send" on:click={() => {insertMessage()}} class="inputBtn button-animate roundedBtn hover hoverShadow" title="Enter to send message" tabindex="-1" data-role="send"><i class="fa-solid fa-paper-plane sendIcon"></i></button>
        {/if}
    </div>
</div>

<style lang="scss">

    .footer {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        width: 100%;
        padding: inherit;
        transition: 300ms ease-in-out;
        bottom: 0px;
        padding: 0px 0px 10px 0;
        z-index: 1;
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