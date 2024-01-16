<script lang="ts">
    import { fly } from "svelte/transition";
    import { showStickersPanel, selectedSticker } from "$lib/components/modalManager";
    import { myId } from "$lib/store";
    import { StickerMessageObj, eventTriggerMessageId, messageDatabase, replyTargetId } from "$lib/messageTypes";
    import { makeClasslist, sendMessage, showReplyToast } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import { bounceOut, sineIn } from "svelte/easing";

    const Stickers = [
        { name: "catteftel", count: "24", icon: "14" },
        { name: "text", count: "24", icon: "4" },
        { name: "bear", count: "25", icon: "5" },
        { name: "jack", count: "20", icon: "4" },
        { name: "finn", count: "20", icon: "5" },
        { name: "amongus", count: "24", icon: "11" },
        { name: "cat", count: "29", icon: "15" },
        { name: "emojis", count: "26", icon: "9" },
        { name: "goose", count: "30", icon: "15" },
        { name: "mrpepe", count: "24", icon: "18" },
        { name: "crab", count: "24", icon: "1" },
        { name: "death_note", count: "20", icon: "14" },
        { name: "cutecat", count: "33", icon: "30" },
        { name: "skully", count: "24", icon: "23" },
        { name: "robo", count: "16", icon: "14" },
        { name: "anime", count: "25", icon: "22" },
        { name: "monkey", count: "24", icon: "4" },
        { name: "frog", count: "30", icon: "18" },
        { name: "soul", count: "25", icon: "14" },
    ];


    let stickerHeader: HTMLElement;

    function stickersHandler(node: HTMLElement){

        if (!$selectedSticker){
            selectedSticker.set(Stickers[0].name);
        }

        const unsub = selectedSticker.subscribe(value => {
            document.getElementById(value)?.scrollIntoView({
                block: "center",
                inline: "center",
            });
            localStorage.setItem("selectedSticker", value);
        });

        node.onclick = (e: Event) => {

            const target = e.target as HTMLElement;

            if (target == node){
                showStickersPanel.set(false);
                return;
            }

            if (target.closest('.stickerHeader')){
                //console.log('Hmm.. Choosing sticker group');
                const groupName = target.dataset.group;
                if (groupName){
                    selectedSticker.set(groupName);
                }
                return;
            }

            if (target.closest('.stickerItem') && target.dataset.serial && target.closest('.stickerBoard')){
                const group = $selectedSticker;
                const serial = target.dataset.serial;

                const src = `/stickers/${group}/animated/${serial}.webp`;

                const messageObj = new StickerMessageObj();
                messageObj.src = src;
                messageObj.groupName = group;
                messageObj.number = Number(serial);
                messageObj.sender = $myId;
                messageObj.type = 'sticker';
                messageObj.kind = 'sticker';

                const tempId = crypto.randomUUID();

                if ($replyTargetId){
                    messageObj.replyTo = $replyTargetId;
                    eventTriggerMessageId.set('');
                    replyTargetId.set('');
                    showReplyToast.set(false);
                }

                messageObj.classList = makeClasslist(messageObj);
                
                messageDatabase.update(msg => {
                    msg.set(tempId, messageObj);
                    return msg;
                });

                sendMessage(messageObj, tempId);

                showStickersPanel.set(false);
            }
        }

        return {
            destroy(){
                node.onclick = null;
                unsub();
            }
        }
    }

    function stickersBodyHandler(node: HTMLElement){
        node.onscrollend = () => {
            const head = stickerHeader.querySelector('.selected');
            
            //console.log('Scroll ended. Set headers  to: ', head);
            if (head){
                head.scrollIntoView();
            }
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting){
                    const groupName = entry.target.id;
                    if (groupName){
                        selectedSticker.set(groupName);
                        //console.log('Group changed to : ', groupName);
                    }
                }
            });
        }, {
            root: node,
            threshold: 0.5
        });

        node.onscroll = () => {
            const stickerBoards = node.querySelectorAll('.stickerBoard');
            stickerBoards.forEach(board => {
                observer.observe(board);
            });
        }

        return {
            destroy(){
                node.onscrollend = null;
                node.onscroll = null;
            }
        }
    }

    function moveHeads(direction: 'left' | 'right'){
        stickerHeader.scrollBy({
            left: direction === 'left' ? -100 : 100,
            behavior: 'smooth'
        });
    }

</script>

{#if $showStickersPanel}
<div class="stickerKeyboardContainer" in:fly|global={{y: 20, duration: 200, easing: bounceOut}} out:fly|global={{y: 20, duration: 100, easing: sineIn}} use:stickersHandler>
    <div class="stickerKeyboard">
        <div class="headers">
            <button on:click={() => { moveHeads('left'); }} class="navBtn hoverShadow"><i class="fa-solid fa-chevron-left" /></button>
            <div class="stickerHeader" id="stickerHeader" bind:this={stickerHeader}>
                {#each Stickers as sticker}
                    <img loading="lazy" class="hoverShadow" data-group="{sticker.name}" class:selected={$selectedSticker == sticker.name} src="/stickers/{sticker.name}/animated/{sticker.icon}.webp" alt="{sticker.name}">
                {/each}
            </div>
            <button on:click={() => { moveHeads('right'); }} class="navBtn hoverShadow"><i class="fa-solid fa-chevron-right" /></button>
        </div>
        <div class="stickersBody" id="stickersBody" use:stickersBodyHandler>
            {#each Stickers as sticker}
                <div class="stickerBoard {sticker.name}" id="{sticker.name}">
                    {#each Array.from({ length: +sticker.count }) as _, i}
                        <img loading="lazy" class="stickerItem" data-serial={i+1} src="/stickers/{sticker.name}/static/{i + 1}-mini.webp" alt="{sticker.name}">
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>
{/if}

<style lang="scss">
    .stickerKeyboardContainer {
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 100%;
        z-index: 20;
        backdrop-filter: brightness(0.8);
        display: flex;
        align-items: flex-end;
        justify-content: center;

        .stickerKeyboard{
            position: absolute;
            width: 100%;
            max-width: clamp(300px, 100vw, 600px);
            height: clamp(300px, 40vh, 400px);
            background-color: #111d2a;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            transition: 150ms ease-in-out;

            .headers{
                width: 100%;
                height: max-content;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #244263;
                border-radius: 10px;
                gap: 5px;

                .navBtn{
                    width: 20px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--secondary-dark) !important;
                    font-size: 20px;
                    border-radius: 10px;
                    cursor: pointer;
                    padding: 20px;
                    i{
                        pointer-events: none;
                        color: var(--secondary-dark) !important;
                    }
                }

                .stickerHeader{
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    overflow-x: scroll;
                    gap: 5px;
                    img{
                        width: 35px;
                        height: 35px;
                        min-width: 35px;
                        min-height: 35px;
                        padding: 5px;
                        object-fit: contain;
                        border-radius: 10px;
                        cursor: pointer;
                        background: none;

                        &.selected{
                            background: var(--secondary-dark) !important;
                            &:hover{
                                filter: brightness(0.90) !important;
                            }
                        }
                    }
                }
            }

            .stickersBody{
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                flex-wrap: wrap;
                align-items: flex-start;
                justify-content: flex-start;
                overflow-x: scroll;
                scroll-snap-type: x mandatory;
                gap: 5px;

                .stickerBoard{
                    display: flex;
                    flex-direction: row;
                    height: 100%;
                    overflow-y: scroll;
                    position: relative;
                    justify-content: center;
                    flex-wrap: wrap;
                    align-items: flex-start;
                    gap: 15px;
                    padding: 10px;
                    border-radius: 10px;
                    scroll-snap-align: start;

                    img{
                        width: clamp(70px, 20vw, 90px);
                        height: clamp(70px, 20vw, 90px);
                        object-fit: contain;
                        border-radius: 24px;
                        cursor: pointer;
                        background: rgba(255, 255, 255, 0.1176470588);
                    }
                }
            }
        }
    }
</style>
