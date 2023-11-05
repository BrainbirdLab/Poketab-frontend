<script lang="ts">
    import { get } from "svelte/store";
    import { MessageObj, messageDatabase } from "./messages/messages";
    import { TextMessageObj } from "./messages/messages";
    import Recorder from "./recorder.svelte";
    import { fly } from "svelte/transition";
    import { chatSocket } from "./../chatSocket";

    import {chatRoomStore, selfInfoStore} from "$lib/store";

    chatSocket.on('newMessage', (message: MessageObj, messageId: string) => {
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
            if (lastMessage && lastMessage.sender === get(selfInfoStore).id){
                console.log('last message is self message');
                lastMessage.classList = lastMessage.classList.replace('end', '');
            } else {
                message.classList += ' start';
            }
        } else {
            message.classList += ' start';
        }
    }

    function sendMessage(message: MessageObj, tempId: string){
        chatSocket.emit('newMessage', message, (messageId: string) => {
            console.log('Message sent');
            messageDatabase.update(msg => {
                message.classList += ' delevered';
                msg.delete(tempId);
                msg.set(messageId, message);
                return msg;
            });
        });
    }

    function insertMessage(){
        console.log('message inserted');
        const tempId = crypto.randomUUID();
        let message = new TextMessageObj();
        message.message = newMessage;
        message.sender = $selfInfoStore.id;

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

</script>
    
<div class="footer" transition:fly={{y: 30}}>
    <!--typing indicator-->

    <div class="chatInput">
        <div class="button-animate small btn play-sound inputBtn hoverBtn" id="stickerBtn" title="Choose stickers [Alt+i]"><i class="fa-solid fa-face-laugh-wink"></i></div>
        <!-- Text input -->
        <div class="attachments button-animate small btn play-sound inputBtn hoverBtn" id="attachment" title="Send attactments [Alt+a]"><i class="fa-solid fa-paperclip"></i></div>
        <div class="inputField">
            <div id="textbox" contenteditable="true" class="select" data-placeholder="Message..." tabindex="-1" enterkeyhint="send" style="height: 41px;" bind:innerText={newMessage}></div>
            <Recorder/>
        </div>
        <!-- Send Button-->
        <button id="send" on:click={insertMessage} class="inputBtn button-animate btn small hoverBtn" title="Enter" tabindex="-1" data-role="send"><i class="fa-solid fa-paper-plane sendIcon"></i></button>
    </div>
</div>

<style lang="scss">

    .footer {
        padding-bottom: 10px;
        position: relative;
        left: 50%;
        width: 100%;
        transform: translateX(-50%);
        padding: inherit;
        padding-bottom: 10px;
        transition: 300ms ease-in-out;
        bottom: 0px;
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

        :global(.quickEmoji), .sendIcon{
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

            #textbox {
                padding: 10px 38px 10px 25px;
                width: 100%;
                max-height: 100px;
                min-height: 41px;
                outline: none;
                border: none;
                border-radius: inherit;
                background: var(--glass);
                transition: 100ms ease-in-out;
                font-size: 0.9rem;
                overflow-y: scroll;

                &::before {
                    content: attr(data-placeholder);
                    position: absolute;
                    color: rgba(255, 255, 255, 0.3529411765);
                    font-size: 0.9rem;
                    top: 50%;
                    left: 30px;
                    opacity: 1;
                    visibility: visible;
                    pointer-events: none;
                    transition: 150ms ease-in-out;
                    transform: translateY(-50%);
                }
            }
        }
    }
</style>