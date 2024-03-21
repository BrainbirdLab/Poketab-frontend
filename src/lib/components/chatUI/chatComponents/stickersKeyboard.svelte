<script lang="ts">
    import { fly } from "svelte/transition";
    import { showStickersPanel, selectedSticker } from "$lib/components/modalManager";
    import { myId } from "$lib/store";
    import { StickerMessageObj, eventTriggerMessageId, replyTarget } from "$lib/messageTypes";
    import { sendMessage, showReplyToast } from "$lib/components/chatUI/chatComponents/messages/messageUtils";

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

    let stickersHeader: HTMLElement;

    function stickersHandler(node: HTMLElement){

        if (!$selectedSticker){
            selectedSticker.set(Stickers[0].name);
        }

        const unsub = selectedSticker.subscribe(value => {

            const elem = document.getElementById(value);

            if (!elem){
                return;
            }

            
            elem.scrollIntoView({
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

            if (target.closest('.stickersHeader')){
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

                const tempId = crypto.randomUUID();
                const messageObj = new StickerMessageObj();
                messageObj.src = src;
                messageObj.groupName = group;
                messageObj.number = Number(serial);
                messageObj.sender = $myId;
                messageObj.id = tempId;
                messageObj.type = 'sticker';
                messageObj.baseType = 'sticker';


                if ($replyTarget){
                    messageObj.replyTo = $replyTarget.id;
                    eventTriggerMessageId.set("");
                    replyTarget.set(null);
                    showReplyToast.set(false);
                }

                sendMessage(messageObj);

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
            const head = stickersHeader.querySelector('.selected');
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

        const stickerBoards = node.querySelectorAll('.stickerBoard');
        stickerBoards.forEach(board => {
            observer.observe(board);
        });

        return {
            destroy(){
                node.onscrollend = null;
            }
        }
    }

    function moveHeads(direction: 'left' | 'right'){
        //shift to next head
        selectedSticker.update(value => {
            const index = Stickers.findIndex(sticker => sticker.name == value);
            if (direction == 'left'){
                if (index == 0){
                    return Stickers[Stickers.length - 1].name;
                } else {
                    return Stickers[index - 1].name;
                }
            } else {
                if (index == Stickers.length - 1){
                    return Stickers[0].name;
                } else {
                    return Stickers[index + 1].name;
                }
            }
        });
    }

</script>

<div class="stickerKeyboardContainer" transition:fly|global={{y: 40, duration: 100}} use:stickersHandler>
    <div class="stickerKeyboard">
        <div class="headers">
            <button on:click={() => { moveHeads('left'); }} class="navBtn hoverShadow"><i class="fa-solid fa-chevron-left" /></button>
            <div class="stickersHeader" id="stickersHeader" bind:this={stickersHeader}>
                {#each Stickers as sticker}
                    <img height="35px" width="35px" loading="lazy" class="hoverShadow" data-group="{sticker.name}" class:selected={$selectedSticker == sticker.name} src="/stickers/{sticker.name}/animated/{sticker.icon}.webp" alt="{sticker.name}">
                {/each}
            </div>
            <button on:click={() => { moveHeads('right'); }} class="navBtn hoverShadow"><i class="fa-solid fa-chevron-right" /></button>
        </div>
        <div class="stickersBody" id="stickersBody" use:stickersBodyHandler>
            {#each Stickers as sticker}
                <div class="stickerBoard {sticker.name}" id="{sticker.name}">
                    {#each Array.from({ length: +sticker.count }) as _, i}
                        <img loading="eager" class="stickerItem" data-serial={i+1} src="/stickers/{sticker.name}/static/{i + 1}-mini.webp" alt="{sticker.name}">
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style lang="scss">
    .stickerKeyboardContainer{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-end;
        height: 100%;
        width: 100%;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 20;

        .stickerKeyboard{
            position: absolute;
            bottom: 0;
            max-width: clamp(300px, 100vw, 600px);
            height: clamp(300px, 40vh, 400px);
            background: var(--primary-dark);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            
            border-radius: 23px 23px 0 0;
            
            .headers{
                width: 100%;
                height: max-content;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                padding: 5px;
                gap: 5px;
                border-radius: 23px;
                background: var(--glass);

                .navBtn{
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 35px;
                    min-width: 35px;
                    width: 35px;
                    border-radius: 50%;
                    color: var(--secondary-dark);
                    i {
                        color: var(--secondary-dark);
                    }
                }

                .stickersHeader{
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 2px;
                    overflow-x: scroll;

                    img{
                        height: 35px;
                        width: 35px;
                        max-width: 35px;
                        max-height: 35px;
                        //padding: 5px;
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

                height: 100%;
                width: 100%;
                overflow: auto;
                display: flex;
                flex-direction: row;
                align-items: flex-start;
                justify-content: flex-start;
                scroll-snap-type: x mandatory;
                
                .stickerBoard{
                    padding: 10px;
                    height: 100%;
                    width: 100%;
                    min-width: 100%;
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    align-items: flex-start;
                    justify-content: center;
                    gap: 10px;
                    overflow-y: scroll;
                    scroll-snap-align: start;

                    img{
                        width: clamp(70px, 20vw, 90px);
                        height: clamp(70px, 20vw, 90px);
                        object-fit: contain;
                        border-radius: 24px;
                        cursor: pointer;
                        background: #ffffff1e;
                    }
                }
            }
        }
    }
</style>
