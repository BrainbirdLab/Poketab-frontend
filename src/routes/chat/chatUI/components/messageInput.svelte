<script lang="ts">
    import { MessageObj, messageDatabase, makeClasslist, sendMessage, ServerMessageObj, isEmoji, emojiParser, filterMessage, lastSeenMessage } from "./messages/messages";
    import Recorder from "./recorder.svelte";
    import { fly } from "svelte/transition";
    import { socket } from "../../../socket";

    import {SEND_METHOD, chatRoomStore, currentTheme, quickEmojiEnabled, selfInfoStore, sendMethod, userTypingString} from "$lib/store";
    import { showAttachmentPickerPanel, showStickersPanel } from "./modalManager";
    import { themesMap } from "$lib/themes";

    socket.on('newMessage', (message: MessageObj, messageId: string) => {

        console.log(message);

        message = Object.assign(new MessageObj(), message);

        message.message = filterMessage(message.message);

        lastSeenMessage.set(messageId);

        messageDatabase.update(messages => {
            message.classList = makeClasslist(message);
            message.sent = true;

            messages.set(messageId, message);
           
            return messages;
        });
    });

    socket.on('server_message', (msg: {text: string, id: string}, type: string) => {

        console.log(msg);
            
        messageDatabase.update(messages => {

            const message: ServerMessageObj = new ServerMessageObj();
            message.text = msg.text;
            message.type = type;

            messages.set(msg.id, message);

            return messages;
        });
    });

    socket.on('react', (messageId: string, uid: string, react: string) => {
        messageDatabase.update(messages => {
            const message = messages.get(messageId) as MessageObj;
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


    socket.on('seen', (uid: string, messageId: string) => {

        if (!uid || !messageId) {
            console.log('invalid seen');
            return;
        }

        messageDatabase.update(messages => {
            
            const message = messages.get(messageId) as MessageObj;

            console.log($chatRoomStore.userList, uid, messageId, $chatRoomStore.userList[uid]);
            
            console.log(`seen by ${$chatRoomStore.userList[uid].name} on ${message.message}`);
            if (message && message instanceof MessageObj) {
                message.seenBy[uid] = true;
            }

            return messages;
        });
    });
    
    let newMessage = '';

    function insertMessage(quickEmoji = false){

        const message: MessageObj = new MessageObj();

        newMessage = filterMessage(emojiParser(newMessage));

        if (quickEmoji){
            console.log('quick emoji');
            newMessage = $quickEmojiEnabled ? themesMap[$currentTheme]['emoji'] : '';
            message.type = 'emoji';
            message.kind = 'text';
        } else if (isEmoji(newMessage)) {
            message.type = 'emoji';
            message.kind = 'text';
        } else {
            message.type = 'text';
            message.kind = 'text';
        }

        if (newMessage.trim() === ''){
            return;
        }

        const tempId = crypto.randomUUID();
        message.message = newMessage.trim();
        message.sender = $selfInfoStore.uid;

        message.classList = makeClasslist(message);

        //console.log(message);

        messageDatabase.update(msg => {
            msg.set(tempId, message);
            return msg;
        });

        newMessage = '';

        sendMessage(message, tempId);

        setTimeout(() => {
            document.getElementById('textbox')?.focus();
        }, 100);
    }

    //if text contains only whitespace characters then return true
    function isWhitespace(text: string) {
        //convert <br> to whitespace
        return !/[^\s]/.test(text);
    }

    let isTypingTimeout: NodeJS.Timeout;

    const inputHandler = (e: Event) => {

        const target = e.target as HTMLDivElement;

        if (isWhitespace(target.innerText)) {
            target.innerText = '';
        }

        const clone = target.cloneNode(true) as HTMLDivElement;
        clone.style.height = 'min-content';
        clone.style.position = 'absolute';
        clone.style.top = '-9999px';
        document.body.appendChild(clone);
        // Set the new height based on the content
        target.style.height = `${clone.scrollHeight}px`;
        document.body.removeChild(clone);
        
        userTypingString.set('You are typing');
        
        if (isTypingTimeout) {
            clearTimeout(isTypingTimeout)
        };

        isTypingTimeout = setTimeout(() => {
            userTypingString.set('');
        }, 1000);
    };

    function keyDownHandler(e: KeyboardEvent){

        const target = e.target as HTMLDivElement;

        if ($sendMethod == SEND_METHOD.ENTER && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            insertMessage();
            target.style.height = 'min-content';
        } else if ($sendMethod == SEND_METHOD.CTRL_ENTER && e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            insertMessage();
            target.style.height = 'min-content';
        }
    }

</script>
    
<div class="footer" transition:fly={{y: 30}}>
    <!--typing indicator-->

    <div class="chatInput">
        <button on:click={() => {showStickersPanel.set(true)}} class="button-animate small btn play-sound inputBtn roundedBtn hover hoverShadow" title="Choose stickers [Alt+i]"><i class="fa-solid fa-face-laugh-wink"></i></button>
        
        <button on:click={() => {showAttachmentPickerPanel.set(true)}} class="button-animate small btn play-sound inputBtn roundedBtn hover hoverShadow" title="Send attachment [Alt+a]"><i class="fa-solid fa-paperclip"></i></button>
        
        <!-- Text input -->
        <div class="inputField">
            <div class="textbox-wrapper">
              <div id="textbox" bind:innerText={newMessage} role="textbox" on:input={inputHandler} on:keydown={keyDownHandler} contenteditable="true" class="select" data-placeholder="Message..." tabindex="0" enterkeyhint="send"></div>
            </div>
            <Recorder />
        </div>          
        <!-- Send Button-->
        {#if $quickEmojiEnabled && newMessage.trim().length <= 0}
        <button id="send" on:click={() => {insertMessage(true)}} class="quickEmoji inputBtn button-animate btn small roundedBtn hover hoverShadow" title="Enter" tabindex="-1" data-role="send">{themesMap[$currentTheme]['emoji']}</button>
        {:else}
        <button id="send" on:click={() => {insertMessage()}} class="inputBtn button-animate btn small roundedBtn hover hoverShadow" title="Enter" tabindex="-1" data-role="send"><i class="fa-solid fa-paper-plane sendIcon"></i></button>
        {/if}
        </div>
</div>

<style lang="scss">

    .footer {
        position: relative;
        left: 50%;
        width: 100%;
        transform: translateX(-50%);
        padding: inherit;
        transition: 300ms ease-in-out;
        bottom: 0px;
        padding: 10px 0px;
    }

    .chatInput{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: flex-end;
        position: relative;
        padding: 0 3px;

        #send {
            border: none;
            position: relative;
            background: transparent;
            margin-right: 3px;
        }

        .quickEmoji, .sendIcon{
            animation: pop 300ms ease-in-out forwards;
        }

        .quickEmoji{
            font-size: 1.8rem;
        }

        .inputBtn {
            margin-bottom: 3px;
        }

        .inputField {
            padding: 0 5px;
            margin: 0;
            border-radius: 25px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            width: 100%;
            
            .textbox-wrapper {
                //@at-rootpadding: 10px 38px 10px 25px;
                position: relative;
                width: 100%;
                background: var(--glass);
                overflow: hidden;
                padding: 10px 30px 10px 20px;
                border-radius:25px;
                transition: 200ms;
                min-height: 41px;
                
                #textbox {
                    
                    position: relative;
                    width: 100%;
                    outline:none;
                    resize: none;
                    overflow-y: auto;
                    max-height: 5em;
                    line-height: 1.4rem;
                    font-size: 0.8rem;
                    transition: 200ms;

                    &::before {
                        content: attr(data-placeholder);
                        color: rgba(255, 255, 255, 0.3529411765);
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