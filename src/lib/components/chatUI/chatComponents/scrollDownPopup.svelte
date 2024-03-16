<script lang="ts">
    import { TextMessageObj, StickerMessageObj, messageContainer, messageScrolledPx, notice, FileMessageObj } from "$lib/messageTypes";
    import { chatRoomStore, listenScroll, showScrollPopUp } from "$lib/store";
    import { onDestroy, onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { playMessageSound, toSentenceCase } from "$lib/utils";

    $: {
        if ($messageScrolledPx < 200){
            notice.set(null);
        }
    }

    onMount(()=> {
        
        messageScrolledPx.set($messageContainer.scrollHeight - $messageContainer.scrollTop - $messageContainer.clientHeight);

        listenScroll.set(true);
    })

    onDestroy(() => {
        $messageContainer.onscroll = null;
    });

    const unsub = notice.subscribe((value) => {
        if (value && $showScrollPopUp){
            playMessageSound('notification');
        }
    });

    listenScroll.subscribe((value) => {

        if (!$messageContainer){
            return;
        }

        if (value){
            //console.log('listening to scroll');
            $messageContainer.onscroll = scrollHandler;
        } else {
            //console.log('stop listening to scroll');
            $messageContainer.onscroll = null;
            messageScrolledPx.set(0);
        }
    });

    function scrollHandler(){
        //if scrolled up more than 200px
        //console.log('scrolling...');
        messageScrolledPx.set($messageContainer.scrollHeight - $messageContainer.scrollTop - $messageContainer.clientHeight);
        if ( $messageScrolledPx > 200) {
            showScrollPopUp.set(true);
        } else {
            showScrollPopUp.set(false);
        }
    }

    onDestroy(() => {
        unsub();
    });

</script>

{#if $showScrollPopUp}
    <button class="popup" tabindex="-1" transition:fly={{y: 20, duration: 200}} on:click={()=>{
        $messageContainer.scrollTo({top: $messageContainer.scrollHeight, behavior: "smooth"});
    }}>
    {#if $notice && $messageScrolledPx > 200}
        <div class="content">
            <img src="/images/avatars/{$chatRoomStore.userList[$notice.sender].avatar}(custom).webp" alt="avatar">
            {#if $notice instanceof TextMessageObj}
                {$notice.message}
            {:else if $notice instanceof StickerMessageObj}
                Sticker
            {:else if $notice instanceof FileMessageObj}
                {toSentenceCase($notice.baseType)}
            {/if}
        </div>
    {:else}
        <i class="content fa-solid fa-arrow-down down-btn"></i>
    {/if}
</button>
{/if}

<style lang="scss">

    @mixin flex{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .popup{
        color: var(--foreground-dark);
        cursor: pointer;;
        font-size: 0.8rem;
        position: absolute;
        top: -55px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1;
        border-radius: 25px;
        padding: 10px;
        min-width: 2.5rem;
        min-height: 2.5rem;
        background: var(--primary-dark);
        filter: drop-shadow(2px 4px 5px var(--shadow)) brightness(1);
        
        &:hover{
            filter: drop-shadow(2px 4px 5px var(--shadow)) brightness(0.90);
        }
        
        @include flex;
        
        .content{
            @include flex;
            gap: 5px;
            img{
                width: 1.5rem;
                height: 1.5rem;
                border-radius: 50%;
            }
        }
    }

    .down-btn{
        font-size: 1rem;
        //use the mixin
        @include flex;
    }
</style>