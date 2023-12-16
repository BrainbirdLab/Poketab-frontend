<script lang="ts">
    import {messageDatabase, replyTargetId, type MessageObj, TextMessageObj} from "$lib/messages";
    import {chatRoomStore, selfInfoStore} from "$lib/store";
    import { slide, fly, fade } from "svelte/transition";
    import { showReplyToast } from "./messages/messageUtils";

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
            <div class="title" out:fade={{duration: 200}} in:fly={{y: 10, delay: 200, duration: 200}}>
                <i class="fa-solid fa-reply"></i>
                Repliying to {sender}
            </div>
            <div class="replyData" out:fade={{duration: 200}} in:fly={{x: 5, delay: 250, duration: 200}}>
                {#if message instanceof TextMessageObj}
                    {#if message.kind == 'text'}
                        {message.message}
                    {:else if message.kind == 'sticker'}
                        <img src="{message.message}" alt="Sticker">
                    {/if}
                {/if}
            </div>
        </div>
        <button in:fade={{delay: 300, duration: 200}} class="close" on:click={closeReplyToast}><i class="fa-solid fa-xmark"></i></button>
    </div>
    {/if}
<style lang="scss">
    .container{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 10px;
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
            max-width: 300px;

            .title{
                color: var(--secondary-dark);
            }

            .replyData{
                font-size: 0.7rem;
                color: grey;

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