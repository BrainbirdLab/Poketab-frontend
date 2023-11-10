<script lang="ts">
    import { fly } from "svelte/transition";
    import { showStickersPanel } from "./modalManager";

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

    let selectedSticker: string = "";

    function stickerIsValid(msg: string) {
        //example: amongus/animated/5
        if (!msg.includes("/")) {
            return false;
        } else if (msg.split("/").length != 3) {
            return false;
        }
        const stickerGroup = msg.split("/")[0];
        const stickerNumber = parseInt(msg.split("/")[2]);
        const sticker = Stickers.find(
            (sticker) => sticker.name == stickerGroup
        );
        if (
            !sticker ||
            stickerNumber > parseInt(sticker.count) ||
            stickerNumber < 1
        ) {
            return false;
        } else {
            return true;
        }
    }

    function stickersClickHandler(node: HTMLElement) {

        const clickHandler = (e: Event) => {
            if (e.target == node){
                showStickersPanel.set(false);
            }

            const target = e.target as HTMLElement;

            console.log(target);
        }

        node.addEventListener('click', clickHandler);

        return {
            destroy(){
                node.removeEventListener('click', clickHandler);
            }
        }
    }
</script>

{#if $showStickersPanel}
<div class="stickerKeyboardContainer" transition:fly={{y: 20, duration: 100}} use:stickersClickHandler>
    <div class="stickerKeyboard">
        <div class="headers">
            <div class="prev navBtn hoverShadow"><i class="fa-solid fa-chevron-left" /></div>
            <div class="stickersHeader">
                {#each Stickers as sticker}
                    <img class="hoverShadow" class:selected={selectedSticker == sticker.name} src="/stickers/{sticker.name}/animated/{sticker.icon}.webp" alt="{sticker.name}">
                {/each}
            </div>
            <div class="next navBtn hoverShadow"><i class="fa-solid fa-chevron-right" /></div>
        </div>
        <div class="stickersBody">
            {#each Stickers as sticker}
                <div class="stickerBoard {sticker.name}">
                    {#each Array.from({ length: parseInt(sticker.count) }) as _, i}
                        <img src="/stickers/{sticker.name}/static/{i + 1}-mini.webp" alt="{sticker.name}">
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
            scroll-behavior: smooth;
            transition: 150ms ease-in-out;

            .headers{
                width: 100%;
                height: max-content;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #244263;
                border-radius: 10px;
                scroll-behavior: smooth;

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
                        color: var(--secondary-dark) !important;
                    }
                }

                .stickersHeader{
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    overflow-x: scroll;
                    scroll-behavior: smooth;
                    gap: 5px;
                    img{
                        width: 35px;
                        height: 35px;
                        padding: 5px;
                        object-fit: contain;
                        border-radius: 10px;
                        cursor: pointer;
                        background: none;
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
