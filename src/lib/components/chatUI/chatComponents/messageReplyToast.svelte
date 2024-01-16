<script lang="ts">
    import {messageDatabase, replyTargetId, type MessageObj, TextMessageObj, StickerMessageObj} from "$lib/messageTypes";
    import {chatRoomStore, myId} from "$lib/store";
    import { slide, fly, fade } from "svelte/transition";
    import { getTextData, showReplyToast } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import { bounceOut, elasticOut } from "svelte/easing";
    import { onDestroy, onMount } from "svelte";

    $: message = $messageDatabase.get($replyTargetId) as MessageObj || null;
    $: sender = message ? (message?.sender == $myId ? 'self' : $chatRoomStore.userList[message?.sender]?.name) : 'Unknown';


    $: {
        if (message && message.kind == 'deleted'){
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
    });

    onDestroy(() => {
        replyTargetId.set('');
    })

</script>
<div class="replybox" in:slide={{duration: 600, easing: elasticOut}} out:closeAnimation={{duration: 500, easing: bounceOut}}>
    <div class="content">
        <div class="top">
            <div class="title" out:fade={{duration: 200}} in:fly={{y: 20, delay: 200, duration: 200}}>
                <i class="fa-solid fa-reply"></i>
                Repliying to {sender}
            </div>
            <button in:fade={{delay: 300, duration: 200}} class="close" on:click={closeReplyToast}><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="replyData" out:fade={{duration: 200}} in:fly={{x: 10, delay: 200, duration: 300}}>
            {#if message instanceof TextMessageObj}
                {getTextData(message.message)}
            {:else if message instanceof StickerMessageObj}
                <img src="{message.src}" alt="sticker reply" />
            {/if}
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
        padding: 10px;
        margin-bottom: 10px;
        gap: 10px;
        border-radius: 10px;
        background: var(--primary-dark);
        filter: drop-shadow(0 4px 5px var(--shadow));
        transition: 300ms ease-in-out;
        position: relative;

        .content{
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 5px;
            border-radius: 10px;
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
                font-size: 0.7rem;
                color: grey;
                white-space: pre-wrap;
                img{
                    width: 50px;
                    height: 50px;
                }
            }
        }
    }
</style>