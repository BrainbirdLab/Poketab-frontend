<script lang="ts">
    import { get } from "svelte/store";
    import { MessageObj, messageDatabase } from "./messages/messages";
    import { TextMessageObj } from "./messages/messages";
    import Recorder from "./recorder.svelte";
    import { fly } from "svelte/transition";
    import { socket } from "../../../socket";

    import {chatRoomStore, selfInfoStore, userTypingString} from "$lib/store";
    import { showAttachmentPickerPanel, showStickersPanel } from "./modalManager";

    socket.on('newMessage', (message: MessageObj, messageId: string) => {
        //console.log('New message');
        //console.log(message);
        messageDatabase.update(messages => {

            let classList = '';

            if (!message.replyTo) {
            classList += ' noreply end';
            }

            if (get(chatRoomStore).maxUsers == 2 && !message.replyTo) {
            classList += ' notitle';
            }

            //if the previous message is self message, remove 'end' class from previous message and add 'end' class to current message
            if (messages.size > 0) {
            let lastMessage = [...messages.values()].pop();
            //console.log('Last message ', lastMessage);
            if (lastMessage && lastMessage.sender === message.sender) {
                //console.log('Last message is from same user');
                lastMessage.classList = lastMessage.classList.replace('end', '');
            } else {
                //console.log('Last message is from different user');
                classList += ' start';
            }
            } else {
            classList += ' start';
            }

            message.classList = classList;

            messages.set(messageId, message);
            return messages;
        });
    });
    
    let newMessage = '';

    function makeClasslist(message: MessageObj){
        message.classList = 'self end';

        if (!message.replyTo){
            message.classList += ' noreply';
        }
        if ($chatRoomStore.maxUsers == 2 && !message.replyTo){
            message.classList += ' notitle';
        }

        //if the previous message is self message, remove 'end' class from previous message and add 'end' class to current message
        if (get(messageDatabase).size > 0){
            let lastMessage = [...get(messageDatabase).values()].pop();
            if (lastMessage && lastMessage.sender === get(selfInfoStore).uid){
                //console.log('last message is self message');
                lastMessage.classList = lastMessage.classList.replace('end', '');
            } else {
                message.classList += ' start';
            }
        } else {
            message.classList += ' start';
        }
    }

    function sendMessage(message: MessageObj, tempId: string){
        socket.emit('newMessage', message, (messageId: string) => {
            //console.log('Message sent');
            messageDatabase.update(msg => {
                message.classList += ' delevered';
                msg.delete(tempId);
                msg.set(messageId, message);
                return msg;
            });
        });
    }

    function insertMessage(){

        if (!newMessage.trim()){
            return;
        }

        //console.log('message inserted');
        const tempId = crypto.randomUUID();
        let message = new TextMessageObj();
        message.message = newMessage.trim();
        message.sender = $selfInfoStore.uid;

        makeClasslist(message);

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

    function handleInput(node: HTMLElement) {
        const keydownHandler = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;

            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                insertMessage();
                node.style.height = 'min-content';
            }
            if (isWhitespace(target.innerText)) {
                target.innerText = '';
            }
        };

        const keyupHandler = (e: KeyboardEvent) => {
            const target = node as HTMLDivElement;
            //console.log(target.innerText, target.innerText.length);
            newMessage = target.innerText;
            if (e.key === 'Backspace') {
                if (isWhitespace(target.innerText)) {
                    target.innerText = '';
                }
            }
        };

        let isTypingTimeout: NodeJS.Timeout | null = null;

        const inputHandler = (e: Event) => {
            const clone = node.cloneNode(true) as HTMLDivElement;
            clone.style.height = 'min-content';
            clone.style.position = 'absolute';
            clone.style.top = '-9999px';
            document.body.appendChild(clone);
            // Set the new height based on the content
            node.style.height = `${clone.scrollHeight}px`;
            document.body.removeChild(clone);

            userTypingString.set('You are typing');

            if (isTypingTimeout) {
                clearTimeout(isTypingTimeout)
            };

            isTypingTimeout = setTimeout(() => {
                userTypingString.set('');
            }, 1000);
        };

        node.onkeydown = keydownHandler;
        node.onkeyup = keyupHandler;
        node.oninput = inputHandler;

        return {
            destroy() {
                node.onkeydown = null;
                node.onkeyup = null;
                node.oninput = null;
            },
        };
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
              <div id="textbox" use:handleInput contenteditable="true" class="select" data-placeholder="Message..." tabindex="-1" enterkeyhint="send" bind:innerText={newMessage}></div>
            </div>
            <Recorder />
        </div>          
        <!-- Send Button-->
        <button id="send" class:quickEmoji={false} on:click={insertMessage} class="inputBtn button-animate btn small roundedBtn hover hoverShadow" title="Enter" tabindex="-1" data-role="send"><i class="fa-solid fa-paper-plane sendIcon"></i></button>
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