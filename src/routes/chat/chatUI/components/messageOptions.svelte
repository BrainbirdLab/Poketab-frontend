
<script lang="ts">
    import { fly, slide } from "svelte/transition";
    import {showMessageOptions} from "./modalManager";
    import { socket } from "../../../socket";
    import { MessageObj, messageDatabase, eventTriggerMessageId } from "$lib/messages";
    import { selfInfoStore } from "$lib/store";
    import { showReplyToast } from "./messages/messageUtils";
    import { showPopupMessage } from "$lib/utils/utils";

    const reactArray = {
        primary: ['💙', '😆', '😠', '😢', '😮', '🙂'],
        last: '🌻',
        expanded: ['😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚', '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '🙁', '😖', '😞', '😟', '😤', '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '🥴', '😠', '😡', '🤬', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🥳', '🥺', '🤠', '🤡', '🤥', '🤫', '🤭', '🧐', '🤓', '😈', '👿', '👹', '👺', '💀', '☠', '👻', '👽', '👾', '🤖', '💩', '😺', '😸', '😹', '😻', '🙈', '🙉', '🙊', '🐵', '🐶', '🐺', '🐱', '🦁', '🐯', '🦒', '🦊', '🦝', '🐮', '🐷', '🐗', '🐭', '🐹', '🐰', '🐻', '🐨', '🐼', '🐸', '🦓', '🐴', '🦄', '🐔', '🐲', '🐽', '🐧', '🐥', '🐤', '🐣', '🌻', '🌸', '🥀', '🌼', '🌷', '🌹', '🏵️', '🌺', '🦇', '🦋', '🐌', '🐛', '🦟', '🦗', '🐜', '🐝', '🐞', '🦂', '🕷', '🕸', '🦠', '🧞‍♀️', '🧞‍♂️', '🗣', '👀', '🦴', '🦷', '👅', '👄', '🧠', '🦾', '🦿', '👩🏻', '👨🏻', '🧑🏻', '👧🏻', '👦🏻', '🧒🏻', '👶🏻', '👵🏻', '👴🏻', '🧓🏻', '👩🏻‍🦰', '👨🏻‍🦰', '👩🏻‍🦱', '👨🏻‍🦱', '👩🏻‍🦲', '👨🏻‍🦲', '👩🏻‍🦳', '👨🏻‍🦳', '👱🏻‍♀️', '👱🏻‍♂️', '👸🏻', '🤴🏻', '👳🏻‍♀️', '👳🏻‍♂️', '👲🏻', '🧔🏻', '👼🏻', '🤶🏻', '🎅🏻', '👮🏻‍♀️', '👮🏻‍♂️', '🕵🏻‍♀️', '🕵🏻‍♂️', '💂🏻‍♀️', '💂🏻‍♂️', '👷🏻‍♀️', '👷🏻‍♂️', '👩🏻‍⚕️', '👨🏻‍⚕️', '👩🏻‍🎓', '👨🏻‍🎓', '👩🏻‍🏫', '👨🏻‍🏫', '👩🏻‍⚖️', '👨🏻‍⚖️', '👩🏻‍🌾', '👨🏻‍🌾', '👩🏻‍🍳', '👨🏻‍🍳', '👩🏻‍🔧', '👨🏻‍🔧', '👩🏻‍🏭', '👨🏻‍🏭', '👩🏻‍💼', '👨🏻‍💼', '👩🏻‍🔬', '👨🏻‍🔬', '👩🏻‍💻', '👨🏻‍💻', '👩🏻‍🎤', '👨🏻‍🎤', '👩🏻‍🎨', '👨🏻‍🎨', '👩🏻‍✈️', '👨🏻‍✈️', '👩🏻‍🚀', '👨🏻‍🚀', '👩🏻‍🚒', '👨🏻‍🚒', '🧕🏻', '👰🏻', '🤵🏻', '🤱🏻', '🤰🏻', '🦸🏻‍♀️', '🦸🏻‍♂️', '🦹🏻‍♀️', '🦹🏻‍♂️', '🧙🏻‍♀️', '🧙🏻‍♂️', '🧚🏻‍♀️', '🧚🏻‍♂️', '🧛🏻‍♀️', '🧛🏻‍♂️', '🧜🏻‍♀️', '🧜🏻‍♂️', '🧝🏻‍♀️', '🧝🏻‍♂️', '🧟🏻‍♀️', '🧟🏻‍♂️', '🙍🏻‍♀️', '🙍🏻‍♂️', '🙎🏻‍♀️', '🙎🏻‍♂️', '🙅🏻‍♀️', '🙅🏻‍♂️', '🙆🏻‍♀️', '🙆🏻‍♂️', '🧏🏻‍♀️', '🧏🏻‍♂️', '💁🏻‍♀️', '💁🏻‍♂️', '🙋🏻‍♀️', '🙋🏻‍♂️', '🙇🏻‍♀️', '🙇🏻‍♂️', '🤦🏻‍♀️', '🤦🏻‍♂️', '🤷🏻‍♀️', '🤷🏻‍♂️', '💆🏻‍♀️', '💆🏻‍♂️', '💇🏻‍♀️', '💇🏻‍♂️', '🧖🏻‍♀️', '🧖🏻‍♂️', '🤹🏻‍♀️', '🤹🏻‍♂️', '👩🏻‍🦽', '👨🏻‍🦽', '👩🏻‍🦼', '👨🏻‍🦼', '👩🏻‍🦯', '👨🏻‍🦯', '🧎🏻‍♀️', '🧎🏻‍♂️', '🧍🏻‍♀️', '🧍🏻‍♂️', '🚶🏻‍♀️', '🚶🏻‍♂️', '🏃🏻‍♀️', '🏃🏻‍♂️', '💃🏻', '🕺🏻', '🧗🏻‍♀️', '🧗🏻‍♂️', '🧘🏻‍♀️', '🧘🏻‍♂️', '🛀🏻', '🛌🏻', '🕴🏻', '🏇🏻', '🏂🏻', '💪🏻', '🦵🏻', '🦶🏻', '👂🏻', '🦻🏻', '👃🏻', '🤏🏻', '👈🏻', '👉🏻', '☝🏻', '👆🏻', '👇🏻', '✌🏻', '🤞🏻', '🖖🏻', '🤘🏻', '🤙🏻', '🖐🏻', '✋🏻', '👌🏻', '👍🏻', '👎🏻', '✊🏻', '👊🏻', '🤛🏻', '🤜🏻', '🤚🏻', '👋🏻', '🤟🏻', '✍🏻', '👏🏻', '👐🏻', '🙌🏻', '🤲🏻', '🙏🏻', '🤝🏻', '💅🏻', '📌', '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '💌', '💢', '💥', '💤', '💦', '💨', '💫'],
    };

    let reactIsExpanded = false;

    $: reactedEmoji = ($messageDatabase.get($eventTriggerMessageId) as MessageObj)?.reactedBy[$selfInfoStore.uid] || '';
    $: messageKind = ($messageDatabase.get($eventTriggerMessageId) as MessageObj)?.kind;
    const messageOptions: {[key: string]: string} = {
        Reply: 'fa-solid fa-reply',
        Copy: 'fa-solid fa-clone',
        Download: 'fa-solid fa-download',
        Delete: 'fa-solid fa-trash',
    };

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

            console.log(messageKind);

            if (e.target == node){
                reactIsExpanded = false;
                showMessageOptions.set(false);
            } else if (e.target instanceof HTMLElement && e.target.classList.contains('react')) {
                const react = e.target.dataset.react;
                if (react && reactArray.expanded.includes(react)) {
                    messageDatabase.update((messages) => {
                        const message = messages.get($eventTriggerMessageId) as MessageObj;
                        //console.log(message);
                        if (message) {
                            console.log(message.reactedBy);
                            //message.reacts.set($selfInfoStore.uid, react);

                            //if same react is clicked again, remove it
                            if (message.reactedBy[$selfInfoStore.uid] == react) {
                                //message.reactedBy.delete($selfInfoStore.uid);
                                delete message.reactedBy[$selfInfoStore.uid];
                            } else {
                                //message.reactedBy.set($selfInfoStore.uid, react);
                                message.reactedBy[$selfInfoStore.uid] = react;
                            }
                        }
                        return messages;
                    });

                    //console.log(react);
                    //send the react to the server via socket
                    socket.emit('react', $eventTriggerMessageId, $selfInfoStore.uid, react);
                    //console.log(`React: ${react} sent to ${$targetMessage}`);
                }
                reactIsExpanded = false;
                showMessageOptions.set(false);
            } else if (e.target instanceof HTMLElement && e.target.classList.contains('option')) {
                
                if (e.target.classList.contains('Reply')) {
                    console.log('reply');
                    showReplyToast.set(true);
                } else if (e.target.classList.contains('Copy')) {
                    console.log('copy');
                    const msg = $messageDatabase.get($eventTriggerMessageId) as MessageObj;

                    if (!navigator.clipboard){
                        showPopupMessage('Copy not supported');
                        return;
                    }

                    navigator.clipboard.writeText(msg.message);

                    showPopupMessage('Copied to clipboard!');

                } else if (e.target.classList.contains('Download')) {
                    console.log('download');
                } else if (e.target.classList.contains('Delete')) {
                    console.log('delete');
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
        {#if !reactIsExpanded}
            <div class="primary">
                {#each reactArray.primary as react, i}
                    <div class:shown={showMessageOptions} class="reactContainer roundedBtn" class:selected={reactedEmoji == react}>
                        <div class="react" data-react="{react}">{react}</div>
                    </div>    
                {/each}
                <div class:shown={showMessageOptions} class="reactContainer roundedBtn" class:selected={reactedEmoji == reactArray.last}>
                    <div class="react" data-react="{reactArray.last}">{reactArray.last}</div>
                </div>
                <button class="more roundedBtn" title="More" on:click={()=>{reactIsExpanded = true}}><i class="fa-solid fa-plus"></i></button>
            </div>
        {:else}
        <div class="expandedReacts" transition:slide|global>
            <div class="reacts">
                {#each reactArray.expanded as react}
                <div class="reactContainer roundedBtn" class:selected={reactedEmoji == react}>
                    <div class="react" data-react="{react}">{react}</div>
                </div>
                {/each}
            </div>
        </div>
        {/if}
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
            border-radius: 25px;
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
            //add animation delay of 50ms for each react
            @for $i from 0 through 6 {
                &:nth-of-type(#{$i + 1}) {
                    animation-delay: #{($i * 50)}ms !important;
                }
            }
        }
        
        .react{
            filter: saturate(0.7);
            transition: all 100ms ease-in-out;
            transform-origin: bottom;

            &:hover{
                transform: translateY(-5px);
                filter: saturate(1) drop-shadow(2px 2px 5px rgba(0, 0, 0, 0.5));
            }
        }
        
        .primary{
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            padding: 5px;

            .more{
                background: #ffffff15;
                &:hover{
                    background: #ffffff10;
                }
            }
        }
        
    }

    .expandedReacts{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        height: 55vh;
        padding: 15px;
        overflow: visible;
        background: var(--option-color);
        border-radius: 25px;
        padding: 5px 10px;
        
        .reacts{
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            flex-wrap: wrap;
            height: 100%;
            overflow-y: scroll;
            gap: 5px;
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