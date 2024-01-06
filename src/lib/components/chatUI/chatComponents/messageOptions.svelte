
<script lang="ts">
    import { fade, fly } from "svelte/transition";
    import {showMessageOptions} from "../../modalManager";
    import { socket } from "$lib/components/socket";
    import { MessageObj, messageDatabase, eventTriggerMessageId, replyTargetId, TextMessageObj } from "$lib/messages";
    import { selfInfoStore } from "$lib/store";
    import { showReplyToast } from "$lib/components/messages/messageUtils";
    import { showToastMessage } from "$lib/components/toast";
    import EmojiPicker from "./emojiPicker.svelte";
    import { copyText, emojis, spin } from "$lib/utils";
    import { onMount } from "svelte";

    const reactArray = {
        reacts: ['💙', '😆', '😠', '😢', '😮', '🙂'],
        last: '🌻'
    };

    let reactIsExpanded = false;

    $: reactedEmoji = ($messageDatabase.get($eventTriggerMessageId) as MessageObj)?.reactedBy[$selfInfoStore.uid] || '';
    $: messageKind = ($messageDatabase.get($eventTriggerMessageId) as MessageObj)?.kind;

    let selectedReact = '';

    const messageOptions: {[key: string]: string} = {
        Reply: 'fa-solid fa-reply',
        Copy: 'fa-solid fa-clone',
        Download: 'fa-solid fa-download',
        Delete: 'fa-solid fa-trash',
    };

    onMount(() => {
        const lastReact = localStorage.getItem('lastReact') || reactArray.last;
        if (emojis.includes(lastReact)){
            reactArray.last = lastReact;
        }
    });

    function getMessageOptions(){
        const arr = [];
        arr.push('Reply');
        if (messageKind == 'text'){
            arr.push('Copy');
        } else if (messageKind == 'file'){
            arr.push('Download');
        }
        
        //if the sender is me, add delete option
        if (($messageDatabase.get($eventTriggerMessageId) as MessageObj)?.sender == $selfInfoStore.uid){
            arr.push('Delete');
        }

        return arr;
    }

    function clickHandler(node: HTMLElement){
        node.onclick = (e: MouseEvent) => {

            if (e.target == node){
                reactIsExpanded = false;
                showMessageOptions.set(false);
            } else if (e.target instanceof HTMLElement && e.target.classList.contains('emoji')) {
                selectedReact = e.target.dataset.emoji as string || '';
                if (selectedReact && emojis.includes(selectedReact)) {
                    messageDatabase.update((messages) => {
                        const message = messages.get($eventTriggerMessageId) as MessageObj;
                        if (message) {
                            //if same emoji is clicked again, remove it
                            if (message.reactedBy[$selfInfoStore.uid] == selectedReact) {
                                delete message.reactedBy[$selfInfoStore.uid];
                            } else {
                               
                                if (!reactArray.reacts.includes(selectedReact) && emojis.includes(selectedReact)){
                                    reactArray.last = selectedReact;
                                    localStorage.setItem('lastReact', selectedReact);
                                }

                                message.reactedBy[$selfInfoStore.uid] = selectedReact;
                            }
                        }
                        return messages;
                    });

                    //send the emoji to the server via socket
                    socket.emit('react', $eventTriggerMessageId, $selfInfoStore.uid, selectedReact);
                }
                reactIsExpanded = false;
                showMessageOptions.set(false);
            } else if (e.target instanceof HTMLElement && e.target.classList.contains('option')) {
                
                if (e.target.classList.contains('Reply')) {
                    //console.log('reply');
                    replyTargetId.set($eventTriggerMessageId);
                    showReplyToast.set(true);
                } else if (e.target.classList.contains('Copy')) {
                    //console.log('copy');
                    const msg = $messageDatabase.get($eventTriggerMessageId) as TextMessageObj;

                    if (!msg) return;

                    //make html element to put data
                    const elem = document.createElement('div');
                    elem.innerHTML = msg.message;
                    const text = elem.innerText;
                    //copy the text
                    copyText(text);

                } else if (e.target.classList.contains('Download')) {
                    console.log('download');
                } else if (e.target.classList.contains('Delete')) {
                    //console.log('delete');
                    socket.emit('deleteMessage', $eventTriggerMessageId, $selfInfoStore.uid);
                }

                reactIsExpanded = false;
                showMessageOptions.set(false);
            }
        }

        return {
            destroy(){
                node.onclick = null;
            }
        }
    }

</script>

<!-- option menu for message right click -->
<!-- This menu contains reacts, message copy, download, delete and reply options -->
{#if $showMessageOptions}
<div class="optionsContainer" use:clickHandler>
    <div class="reactionsChooser" transition:fly={{y: -10, duration: 200}}>
        {#if reactIsExpanded}
            <EmojiPicker selectedEmoji={selectedReact} exclude={[...reactArray.last, ...reactArray.reacts]} onClose={()=>{
                reactIsExpanded = false;
            }}/>
        {/if}
        <div class="primary">
            {#each reactArray.reacts as react}
                <div class:shown={showMessageOptions} class="reactContainer roundedBtn" class:selected={reactedEmoji == react}>
                    <div class="emoji" data-emoji="{react}">{react}</div>
                </div>    
            {/each}
            <div class:shown={showMessageOptions} class="reactContainer roundedBtn" class:selected={reactedEmoji == reactArray.last}>
                <div class="emoji" data-emoji="{reactArray.last}">{reactArray.last}</div>
            </div>
            {#if !reactIsExpanded}
                <button in:spin={{duration: 250, degree: 180}} class="more roundedBtn" title="More" on:click={()=>{reactIsExpanded = true}}><i class="fa-solid fa-caret-up"></i></button>
            {:else}
                <button in:spin={{duration: 250, degree: 180}} class="more roundedBtn" title="Less" on:click={()=>{reactIsExpanded = false}}><i class="fa-solid fa-caret-down"></i></button>
            {/if}
        </div>
    </div>
    <div class="messageOptions" transition:fly={{y: 10, duration: 200}}>
        {#each getMessageOptions() as option, i}
        <div in:fly|global={{y: 10, delay: ((i+1)*50)}} class="option {option}" class:delete={option == 'Delete'} title="{option}">
            <i class="{messageOptions[option]}"></i>
            {option}
        </div>
        {/each}
    </div>
</div>
{/if}

<style lang="scss">

    .messageOptions{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 15px;
        width: 400px;
        max-width: 100%;
        transition: all 100ms ease-in-out;
        filter: drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.5));
        border-radius: 15px 15px 0 0;
        background: var(--option-color);

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
            color: var(--foreground-dark);

            i{
                color: var(--secondary-dark);
            }

            &.delete i{
                color: var(--red);
            }

            > * {
                pointer-events: none;
            }
        }
    }

    .optionsContainer{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.162);
        z-index: 20;
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
            filter: drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.5));
            max-width: min(300px, 95vw);
            background: var(--option-color);
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