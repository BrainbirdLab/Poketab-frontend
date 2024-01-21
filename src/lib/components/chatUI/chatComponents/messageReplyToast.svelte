<script lang="ts">
    import {messageDatabase, replyTargetId, type MessageObj, TextMessageObj, StickerMessageObj, FileMessageObj, ImageMessageObj, AudioMessageObj} from "$lib/messageTypes";
    import {chatRoomStore, myId} from "$lib/store";
    import { slide, fly, fade, scale } from "svelte/transition";
    import { getTextData, showReplyToast } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import { bounceOut, elasticOut } from "svelte/easing";
    import { onDestroy, onMount } from "svelte";
    import { getIcon } from "$lib/utils";

    $: message = $messageDatabase.get($replyTargetId) as MessageObj || null;
    $: sender = message ? (message?.sender == $myId ? 'self' : $chatRoomStore.userList[message?.sender]?.name) : 'Unknown';


    $: {
        if (message && message.baseType == 'deleted'){
            closeReplyToast();
        }
    }

    let userClosed = false;

    function closeAnimation(node: HTMLElement, options: {duration: number,  easing: (t: number) => number}){
        //wrap the slide transition. If user close the toast by clicking the close button, the toast will use duration 100, easing none
        //if user close the toast by clicking the message, the toast will use duration 500, easing bounceOut
        
        if (userClosed){
            return slide(node, options);
        }
        
        return slide(node, {duration: 100});
    }

    function closeReplyToast(){
        userClosed = true;
        showReplyToast.set(false);
    }

    onMount(() => {
        userClosed = false;
        console.log(message);
    });

    onDestroy(() => {
        replyTargetId.set('');
    })

</script>
<div class="replybox" in:slide={{duration: 600, easing: elasticOut}} out:closeAnimation={{duration: 500, easing: bounceOut}}>
    
    <div class="wrapper">
        <div class="content">
            <div class="top">
                <div class="title" out:fade|global={{duration: 200}} in:fly|global={{y: 20, delay: 200, duration: 200}}>
                    <i class="fa-solid fa-reply"></i>
                    Repliying to {sender}
                </div>
                <button out:scale|global={{duration: 50}} in:scale|global={{delay: 300, duration: 200}} class="close" on:click={closeReplyToast}><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="replyData" out:fade|global={{duration: 200}} in:fly|global={{x: 10, delay: 150, duration: 300}}>
                {#if message instanceof TextMessageObj}
                    {getTextData(message.message)}
                {:else if message instanceof ImageMessageObj}
                    <img class="image" src="{message.url}" alt="{message.name}">
                {:else if message instanceof FileMessageObj}
                    <i class="icon fa-solid {getIcon(message.type)}"></i> 
                    {getTextData(message.name)}
                {:else if message instanceof StickerMessageObj}
                    <img class="sticker" src="{message.src}" alt="sticker reply" />
                {/if}
            </div>
        </div>
    </div>
    
</div>
<style lang="scss">
    .replybox{
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;
        max-width: 98vw;
        gap: 10px;
        //filter: drop-shadow(0 4px 5px var(--shadow));
        position: relative;
        
        .wrapper{
            padding: 3px;
            border-radius: 21px 21px 10px 10px;
            width: 100%;
        }
        
        .content{
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            padding: 10px;
            gap: 5px;
            border-radius: inherit;
            background: var(--glass);
            width: 100%;

            .top{
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: 5px;

                .title{
                    color: var(--secondary-dark);
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }

                .close{
                    width: 25px;
                    height: 25px;
                    border-radius: 50%;
                    aspect-ratio: 1/1;
                    display: flex;
                    align-items: center;
                    justify-content: center;

                    &:hover{
                        filter: brightness(0.90);
                    }

                    i{
                        font-size: 1.3rem;
                    }
                }
            }


            .replyData{
                overflow: hidden;
                width: 100%;
                white-space: pre;
                text-align: left;
                text-overflow: ellipsis;
                font-size: 0.8rem;
                color: #c5c5c5;

                .sticker{
                    width: 50px;
                    height: 50px;
                    display: block;
                }

                .image{
                    max-height: 100px;
                    max-width: 100px;
                    border-radius: 3px;
                    display: block;
                }

                .icon{
                    font-size: 20px;
                    padding-right: 5px;
                    color: #ffffffae;
                }
            }
        }
    }
</style>