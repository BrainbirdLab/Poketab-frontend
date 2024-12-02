<script lang="ts">

    import { TextMessageObj, StickerMessageObj, FileMessageObj, MessageObj, notice } from "$lib/messageStore.svelte";
    import { chatRoomStore, listenScroll, showScrollPopUp, messageContainer, messageScrolledPx } from "$lib/store.svelte";
    import { onDestroy, onMount } from "svelte";
    import { fly } from "svelte/transition";
    import { playMessageSound, toSentenceCase } from "$lib/utils";
    import { focusMessage } from "./messages.svelte";

    $effect(() => {
        if (messageScrolledPx.value < 200){
            notice.value = null;
        }
    });

    onMount(()=> {

        //ask for notification permission
        Notification.requestPermission();
        
        messageScrolledPx.value = messageContainer.value.scrollHeight - messageContainer.value.scrollTop - messageContainer.value.clientHeight;

        listenScroll.value = true;

        document.onvisibilitychange = () => {
            if (document.visibilityState === 'visible'){
                notification?.close();
            }
        }
    })

    onDestroy(() => {
        messageContainer.value.onscroll = null;
        document.onvisibilitychange = null;
    });

    let notification: Notification;

    function showNotification(value: MessageObj | null){
        if (!document.hasFocus()){
            //show a notification
            if (value){

                let msg = '';

                if (value instanceof TextMessageObj){
                    msg = value.message;
                } else if (value instanceof StickerMessageObj){
                    msg = 'Sticker';
                } else if (value instanceof FileMessageObj){
                    msg = toSentenceCase(value.baseType);
                }

                Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                        notification = new Notification(chatRoomStore.value.userList[value.sender].avatar, {
                            body: msg,
                            data: value.id,
                            icon: `/images/avatars/${chatRoomStore.value.userList[value.sender].avatar}(custom).webp`,
                            tag: value.sender
                        });

                        notification.onclick = () => {
                            window.focus();
                            notification.close();
                            focusMessage(value.id);
                        }
                    }
                });
            }
        } 
    }

    const unsub = notice.onChange((value) => {

        if (value && showScrollPopUp.value){
            playMessageSound('notification');
        }
        showNotification(value);
    });

    const unsubScroll = listenScroll.onChange((value) => {
        if (!messageContainer.value){
            return;
        }

        if (value){
            messageContainer.value.onscroll = scrollHandler;
        } else {
            messageContainer.value.onscroll = null;
            messageScrolledPx.value = 0;
        }
    });

    function scrollHandler(){
        //if scrolled up more than 200px
        messageScrolledPx.value = messageContainer.value.scrollHeight - messageContainer.value.scrollTop - messageContainer.value.clientHeight;
        if ( messageScrolledPx.value > 200) {
            showScrollPopUp.value = true;
        } else {
            showScrollPopUp.value = false;
        }
    }

    onDestroy(() => {
        unsub();
        unsubScroll();
    });

</script>

{#if showScrollPopUp.value}
    <button class="popup box-shadow back-blur" tabindex="-1" transition:fly={{y: 20, duration: 200}} onclick={()=>{
        messageContainer.value.scrollTo({top: messageContainer.value.scrollHeight, behavior: "smooth"});
    }}>
    {#if notice.value && messageScrolledPx.value > 200}
        <div class="content">
            <img src="/images/avatars/{chatRoomStore.value.userList[notice.value.sender].avatar}(custom).webp" alt="avatar"/>
            {#if notice.value instanceof TextMessageObj}
                {notice.value.message}
            {:else if notice.value instanceof StickerMessageObj}
                Sticker
            {:else if notice.value instanceof FileMessageObj}
                {toSentenceCase(notice.value.baseType)}
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
        color: var(--text-color);
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
        background: var(--modal-color);
        filter: brightness(1);
        
        &:hover{
            filter: brightness(0.90);
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