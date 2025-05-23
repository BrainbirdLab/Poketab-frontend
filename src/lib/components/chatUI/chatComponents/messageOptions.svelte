
<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import { socket } from "$lib/connection/socketClient";
    import { MessageObj, TextMessageObj, FileMessageObj, AudioMessageObj, eventTriggerMessageId, messageDatabase, replyTarget } from "$lib/messageStore.svelte";
    import { chatRoomStore, myId, reactArray } from "$lib/store.svelte";
    import { showReplyToast } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import EmojiPicker from "./emojiPicker.svelte";
    import { copyText, emojis, playMessageSound, spin } from "$lib/utils";
    import { onMount } from "svelte";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { clearModals } from "../stateManager.svelte";
    import { page } from "$app/state";
    import MessageInfo from "./messageInfo.svelte";

    let reactIsExpanded = $state(false);
    let showMessageInfo = $state(false);

    let selectedReact = $state('');

    const messageOptions: {[key: string]: string} = {
        Reply: 'fa-solid fa-reply',
        Copy: 'fa-solid fa-clone',
        Download: 'fa-solid fa-download',
        Delete: 'fa-solid fa-trash',
        Info: 'fa-solid fa-info-circle',
    };

    onMount(() => {
        const lastReact = localStorage.getItem('lastReact') || reactArray.value.last;
        if (emojis.includes(lastReact)){
            reactArray.value.last = lastReact;
        }
        playMessageSound('reactsMenu');
    });

    function getMessageOptions(){

        if (!message) {
            return [];
        }

        const arr = [];

        if (sender && chatRoomStore.value.userList[sender] && message.sent){
            arr.push('Reply');
            //if the sender is me, add delete option
            if (sender == myId.value){
                arr.push('Delete');
            }
        }

        if (messageKind == 'text'){
            arr.push('Copy');
        }

        return arr;
    }

    function clickHandler(node: HTMLElement){
        node.onclick = (e: MouseEvent) => {
            if (e.target == node){
                reactIsExpanded = false;
                clearModals();
            } else if (e.target instanceof HTMLElement && e.target.classList.contains('emoji')) {

                if (!message){
                    return;
                }

                selectedReact = e.target.dataset.emoji as string || '';
                if (selectedReact && emojis.includes(selectedReact)) {
                    //send the emoji to the server via socket
                    socket.emit('react', message.id, chatRoomStore.value.Key, myId.value, selectedReact);
                }
                reactIsExpanded = false;
                clearModals();
            } else if (e.target instanceof HTMLElement && e.target.classList.contains('option')) {
                
                if (e.target.classList.contains('Reply')) {
                    replyTarget.value = message;
                    showReplyToast.value = true;
                } else if (e.target.classList.contains('Copy')) {

                    if (!(message)) return;

                    //make html element to put data
                    const elem = document.createElement('div');
                    elem.innerHTML = (message as TextMessageObj).message;
                    const text = elem.innerText;
                    //copy the text
                    copyText(text);

                } else if (e.target.classList.contains('Download')) {

                    if (message instanceof FileMessageObj){
                        if (message instanceof AudioMessageObj){
                            if (!message.audio.src){
                                return;
                            }
                        } else {
                            if (!message.url){
                                return;
                            }
                        }
                    }
                    
                    showToastMessage('Preparing download...');

                    //create a link and click it to download the file
                    const link = document.createElement('a');
                    link.href = (message as FileMessageObj).url;
                    link.download = (message as FileMessageObj).name;
                    link.click();

                } else if (e.target.classList.contains('Delete')) {
                    if (!message){
                        return;
                    }
                    socket.emit('deleteMessage', message.id, chatRoomStore.value.Key, myId.value);
                } else if (e.target.classList.contains('Info')) {
                    showMessageInfo = true;
                    return;
                }

                reactIsExpanded = false;
                clearModals();
            }
        }

        return {
            destroy(){
                node.onclick = null;
                selectedReact = '';
                eventTriggerMessageId.value = "";
            }
        }
    }

    let message = $derived($messageDatabase[messageDatabase.getIndex(eventTriggerMessageId.value)] as MessageObj);
    let reactedEmoji = $derived(message?.reactedBy.get(myId.value) || '');
    let messageKind = $derived(message?.baseType);
    let sender = $derived(message?.sender);
    let isSent = $derived(message?.sent);
    let downloadable = $derived((message instanceof FileMessageObj) ? (sender === myId.value ? true : (message as FileMessageObj).loaded >= 100) : false);
    let optionsArray = $derived([...getMessageOptions(), downloadable ? 'Download' : null, isSent && chatRoomStore.value.userList[message.sender] ? 'Info' : null]);
</script>

<!-- option menu for message right click -->
<!-- This menu contains reacts, message copy, download, delete and reply options -->
<div class="optionsContainer" use:clickHandler out:fade={{duration: 300}}>
    {#if !showMessageInfo && chatRoomStore.value.userList[message.sender]}
    <div class="reactionsChooser box-shadow back-blur" transition:fly|global={{y: -10, duration: 200}}>
        {#if reactIsExpanded}
            <EmojiPicker selectedEmoji={selectedReact} exclude={[...reactArray.value.last, ...reactArray.value.reacts]} onClose={()=>{
                reactIsExpanded = false;
            }}/>
        {/if}
        <div class="primary">
            {#each reactArray.value.reacts as react}
                <div class:shown={page.state.showMessageOptions} class="reactContainer roundedBtn" class:selected={reactedEmoji == react}>
                    <div class="emoji" data-emoji="{react}">{react}</div>
                </div>
            {/each}
            
            <!-- Show reactedEmoji as last react if has, else show reactArray.value.last as last -->
            {#if reactedEmoji && !reactArray.value.reacts.includes(reactedEmoji)}
                <div class="reactContainer roundedBtn" class:selected={true}>
                    <div class="emoji" data-emoji="{reactedEmoji}">{reactedEmoji}</div>
                </div>
            {:else}
                <div class="reactContainer roundedBtn" class:selected={selectedReact == reactArray.value.last}>
                    <div class="emoji" data-emoji="{reactArray.value.last}">{reactArray.value.last}</div>
                </div>
            {/if}

            {#if !reactIsExpanded}
                <button aria-label="more" in:spin={{duration: 250, degree: 180}} class="more roundedBtn" title="More" onclick={()=>{reactIsExpanded = true}}><i class="fa-solid fa-caret-up"></i></button>
            {:else}
                <button aria-label="more" in:spin={{duration: 250, degree: 180}} class="more roundedBtn" title="Less" onclick={()=>{reactIsExpanded = false}}><i class="fa-solid fa-caret-down"></i></button>
            {/if}
        </div>
    </div>
    {/if}
    <div class="messageOptions box-shadow back-blur" transition:fly|global={{y: 10, duration: 200}}>
        {#if showMessageInfo}
            <MessageInfo message={message}/>
        {:else}
            {#key optionsArray}
            {#each optionsArray as option, i (i) }
            {#if option != null}
                <div in:fly|global={{y: 10, delay: ((i+1)*50)}} class="option {option}" class:delete={option == 'Delete'} title="{option}">
                    <i class="{messageOptions[option]}"></i>
                    {option}
                </div>
            {/if}
            {/each}
            {/key}
        {/if}
    </div>
</div>

<style lang="scss">

    .messageOptions{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 10px;
        min-height: 75px;
        padding: 12px;
        width: 400px;
        max-width: 100%;
        transition: height 1000ms ease-in-out;
        border-radius: 15px 15px 0 0;
        background: var(--modal-color);

        .option{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            padding: 5px 10px;
            border-radius: 10px;
            transition: all 100ms ease-in-out;
            cursor: pointer;
            font-size: 0.7rem;
            color: var(--text-color);

            i{
                color: var(--secondary-dark);
            }

            &.delete i{
                color: var(--red-color);
            }

            > * {
                pointer-events: none;
            }
        }
    }

    .optionsContainer{
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.162);
        z-index: 100;
        gap: 50px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        flex-direction: column;
        
        .reactionsChooser{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 5px;
            transition: all 100ms ease-in-out;
            max-width: min(300px, 95vw);
            background: var(--modal-color);
            border-radius: 23px;
            padding: 5px;
        }

        .reactContainer.selected{
            background: var(--secondary-dark);
        }

        .reactContainer{
            transition: all 100ms ease-in-out;
            transform-origin: bottom;
            font-size: 1.5rem;
            animation: bubbleUp 500ms ease-in-out forwards;
            opacity: 0;
            //add animation delay of 50ms for each emoji
            @for $i from 0 through 6 {
                &:nth-of-type(#{$i + 1}) {
                    animation-delay: #{($i * 50)}ms !important;
                }
            }
        }
        
        .primary{
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            gap: 1.4px;
            transition: 200ms ease-in-out;

            .more{
                background: #ffffff15;
                &:hover{
                    background: #ffffff10;
                }
            }
        }
        
    }

    @keyframes bubbleUp {
        0% {
            opacity: 0;
            transform: scale(0);
        }
        25% {
            opacity: 0.5;
            transform: scale(1.3);
        }
        50% {
            opacity: 1;
            transform: scale(0.8);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>