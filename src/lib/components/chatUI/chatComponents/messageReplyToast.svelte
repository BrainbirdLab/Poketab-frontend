<script lang="ts">
    import {messageDatabase, replyTargetId, type MessageObj, TextMessageObj, StickerMessageObj} from "$lib/messages";
    import {chatRoomStore, selfInfoStore} from "$lib/store";
    import { slide, fly, fade } from "svelte/transition";
    import { getTextData, showReplyToast } from "$lib/components/messages/messageUtils";

    $: message = $messageDatabase.get($replyTargetId) as MessageObj || null;
    $: sender = message ? (message?.sender == $selfInfoStore.uid ? 'self' : $chatRoomStore.userList[message?.sender]?.name) : 'unknown';

    function closeReplyToast(){
        showReplyToast.set(false);
        replyTargetId.set('');
    }

</script>
    {#if $showReplyToast && $replyTargetId}
    <div class="container" transition:slide={{duration: 100, axis: "y"}}>
        <div class="content">
            <div class="top">
                <div class="title" out:fade={{duration: 200}} in:fly={{y: 10, delay: 200, duration: 200}}>
                    <i class="fa-solid fa-reply"></i>
                    Repliying to {sender}
                </div>
                <button in:fade={{delay: 300, duration: 200}} class="close" on:click={closeReplyToast}><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="replyData" out:fade={{duration: 200}} in:fly={{x: 5, delay: 250, duration: 200}}>
                {#if message instanceof TextMessageObj}
                    {getTextData(message.message)}
                {:else if message instanceof StickerMessageObj}
                    <img src="{message.src}" alt="sticker reply" />
                {/if}
            </div>
        </div>
    </div>
    {/if}
<style lang="scss">
    .container{
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        width: 100%;
        max-width: 98vw;
        padding: 10px;
        gap: 10px;
        border-radius: 10px;
        background: var(--primary-dark);
        filter: drop-shadow(0 4px 5px black);
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
                    width: 100%;
                    height: 100%;
                    max-width: 50px;
                    max-height: 50px;
                }
            }
        }
    }
</style>