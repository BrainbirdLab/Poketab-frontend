<script lang="ts">

    import { TextMessageObj, StickerMessageObj, FileMessageObj, ImageMessageObj, MessageObj, messageDatabase, replyTarget } from "$lib/messageStore.svelte";
    import {chatRoomStore, myId} from "$lib/store.svelte";
    import { slide, fly, fade, scale } from "svelte/transition";
    import { getTextData, showReplyToast, editMessage } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import { bounceOut } from "svelte/easing";
    import { onDestroy, onMount } from "svelte";
    import { getIcon } from "$lib/utils";

    interface Props {
        purpose: 'reply' | 'edit';
    }

    let { purpose }: Props = $props();

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
        showReplyToast.value = false;
        editMessage.value = false;
    }

    onMount(() => {
        userClosed = false;
    });

    onDestroy(() => {
        replyTarget.value = null;
    })

    let message = $derived($messageDatabase[messageDatabase.getIndex(replyTarget.value?.id || "")] as MessageObj);
    $effect(() => {
        if ( purpose == "reply" && (!message || message.type == 'deleted' || !chatRoomStore.value.userList[message.sender])){
            closeReplyToast();
        }
    });
</script>
<div class="messageTargetBox" in:slide={{duration: 150}} out:closeAnimation={{duration: 500, easing: bounceOut}}>
    
    <div class="wrapper">
        <div class="content">
            <div class="top">
                <div class="title" out:fade|global={{duration: 200}} in:fly|global={{y: 20, delay: 100, duration: 200}}>
                    {#if purpose === 'edit'}
                        <i class="fa-solid fa-pen-to-square"></i>
                        Editing message
                    {:else}
                        <i class="fa-solid fa-reply"></i>
                        Repliying to {replyTarget.value ? (message.sender === myId.value ? 'self' : chatRoomStore.value.userList[message.sender]?.avatar || 'Zombie') : 'Zombie'}
                    {/if}
                </div>
                <button aria-label="close" out:scale|global={{duration: 50}} in:scale|global={{delay: 150, duration: 200}} class="close" onclick={closeReplyToast}><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="messageDataToApply" out:fade|global={{duration: 200}} in:fly|global={{x: 10, delay: 150, duration: 300}}>
                {#if purpose == "edit" && message instanceof TextMessageObj}
                    {getTextData(message.message)}
                {:else}
                    {#if message instanceof TextMessageObj}
                        {getTextData(message.message)}
                    {:else if message instanceof ImageMessageObj}
                        <img class="image" src="{message.url}" alt="{message.name}" />
                    {:else if message instanceof FileMessageObj}
                        <i class="icon fa-solid {getIcon(message.type)}"></i> 
                        {getTextData(message.name)}
                    {:else if message instanceof StickerMessageObj}
                        <img class="sticker" src="{message.src}" alt="sticker reply" />
                    {/if}
                {/if}
            </div>
        </div>
    </div>
    
</div>
<style lang="scss">
    .messageTargetBox{
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;
        max-width: 98vw;
        gap: 10px;
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
            background: var(--glass-color);
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
                    font-size: 0.8rem;
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


            .messageDataToApply{
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