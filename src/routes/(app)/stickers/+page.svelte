<script lang="ts">
    import { onMount } from "svelte";


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

onMount(() => {

    //add css
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);

    const stickersHeader = document.querySelector('.headers') as HTMLElement;
    const stickersBody = document.querySelector('.stickersBody') as HTMLElement;
    
    console.log(stickersHeader, stickersBody);
    
    //add nav buttons, headers, nav buttons
    const left = document.createElement('button');
    left.classList.add('navBtn');
    left.classList.add('hoverShadow');
    left.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
    
    const right = document.createElement('button');
    right.classList.add('navBtn');
    right.classList.add('hoverShadow');
    right.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
    
    stickersHeader.appendChild(left);
    
    const stickerHeader = document.createElement('div');
    stickerHeader.classList.add('stickersHeader');
    
    Stickers.forEach(sticker => {
        const img = document.createElement('img');
        img.src = `/stickers/${sticker.name}/animated/${sticker.icon}.webp`;
        img.alt = sticker.name;
        img.classList.add('hoverShadow');
        img.setAttribute('data-group', sticker.name);
        stickerHeader.appendChild(img);
    });
    
    stickersHeader.appendChild(stickerHeader);
    stickersHeader.appendChild(right);
    
    Stickers.forEach(sticker => {
        const stickerBoard = document.createElement('div') as HTMLElement;
        stickerBoard.classList.add('stickerBoard');
        stickerBoard.classList.add(sticker.name);
        stickerBoard.id = sticker.name;
        for (let i = 0; i < Number(sticker.count); i++) {
            const img = document.createElement('img');
            img.src = `/stickers/${sticker.name}/static/${i + 1}-mini.webp`;
            img.alt = sticker.name;
            img.classList.add('stickerItem');
            img.setAttribute('data-serial', (i + 1).toString());
            stickerBoard.appendChild(img);
        }
        stickersBody.appendChild(stickerBoard);
    });
});

const css = `
.stickerKeyboardContainer {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-end;
            height: 100%;
            width: 100%;
            position: fixed;
            inset: 0;
            z-index: 20;
        }

        .stickerKeyboardContainer .stickerKeyboard {
            position: absolute;
            bottom: 0;
            max-width: clamp(300px, 100vw, 600px);
            height: clamp(300px, 40vh, 400px);
            background: var(--modal-color);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
        }

        .stickerKeyboardContainer .stickerKeyboard .headers {
            width: 100%;
            height: max-content;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            padding: 5px;
            background: var(--glass-color);
        }

        .stickerKeyboardContainer .stickerKeyboard .headers .navBtn {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 35px;
            min-width: 35px;
            width: 35px;
        }

        .stickerKeyboardContainer .stickerKeyboard .headers .stickersHeader {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 2px;
            overflow-x: scroll;
        }

        .stickerKeyboardContainer .stickerKeyboard .headers .stickersHeader img {
            height: 35px;
            width: 35px;
            max-width: 35px;
            max-height: 35px;
            border-radius: 10px;
        }

        .stickerKeyboardContainer .stickerKeyboard .stickersBody {
            height: 100%;
            width: 100%;
            overflow: auto;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            justify-content: flex-start;
            scroll-snap-type: x mandatory;
        }

        .stickerKeyboardContainer .stickerKeyboard .stickersBody .stickerBoard {
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
        }

        .stickerKeyboardContainer .stickerKeyboard .stickersBody .stickerBoard img {
            width: clamp(70px, 20vw, 90px);
            height: clamp(70px, 20vw, 90px);
            object-fit: contain;
            border-radius: 24px;
            cursor: pointer;
            background: #ffffff1e;
        }
`;


</script>

<div class="stickerKeyboardContainer">
    <div class="stickerKeyboard">
        <div class="headers">
        <!-- Insert by js -->
        </div>
        <div class="stickersBody">
        <!-- Insert by js -->
        </div>
    </div> 
</div>