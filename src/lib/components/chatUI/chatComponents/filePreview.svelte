<script lang="ts">
    import { getSize } from "./messages/messageUtils";
    import { selectedFiles } from "$lib/messageTypes";
    import { fly } from "svelte/transition";
    import { flip } from "svelte/animate";
    import { getIcon } from "$lib/utils";


    export let sendAs: 'file' | 'image' | 'audio';
    
    export let urlObjects: Map<string, string>;

    function createURLObject(file: File) {
        const url = URL.createObjectURL(file);
        urlObjects.set(file.name, url);
        return url;
    }

    function fileIsAcceptable(file: File): string {
        if (file.size > 10 * 1024 * 1024) {
           return 'File size must be less than 10 Mb';
        }

        if (sendAs == 'audio') {
            const supportedAudioFormats = ['audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-m4a'];
            if (!supportedAudioFormats.includes(file.type)) {
                return 'Audio format not supported. Try as file.';
            }
        } else if (sendAs == 'image') {
            const supportedImageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!supportedImageFormats.includes(file.type)) {
                return 'Image format not supported. Try as file.';
            }
        }
        return '';
    }

</script>

<div class="selectedFiles">
    {#each $selectedFiles as file, i (file.name)}
        <div
            animate:flip={{duration: 600}}
            in:fly={{y: 10, delay: 50 * (i + 1)}}
            out:fly={{x: -10, duration: 300}}
            class="file_preview"
            data-id={i}
        >
            <i class="close remove fa-solid fa-xmark"></i>
            {#if sendAs === 'image'}
                <img src={createURLObject(file)} alt="preview" />
            {:else}
            <i class="icon fa-solid {getIcon(file.type)}"></i>
            {/if}
            <div class="meta">
                <div class="name">{file.name}</div>
                <div class="size">{getSize(file.size)}</div>
                <div class="error-msg">{fileIsAcceptable(file)}</div>
            </div>
        </div>
    {/each}
</div>
<div class="filePreviewOptions" transition:fly={{y: 10}}>
    <button
        transition:fly={{x: -10, delay: 100}}
        id="cancel"
        class="close button button-animate play-sound btn-with-icon"
        >Cancel <i class="fa-solid fa-trash default"></i></button
    >
    <div class="items-count">
        {$selectedFiles.length} {$selectedFiles.length < 2 ? "item" : "items"} selected
    </div>
    <button 
        transition:fly={{x: 10, delay: 100}}
        id="send"
        class="button button-animate btn-with-icon"
        >Send <i class="fa-solid fa-paper-plane default"></i></button
    >
</div>

<style lang="scss">
    @mixin flex-column-center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    @mixin flex-row-center {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .selectedFiles {
        display: flex;
        justify-content: center;
        align-items: center;
        max-width: 950px;
        width: 100%;
        height: 100%;
        max-height: min-content;
        overflow-x: auto;
        overflow-y: scroll;
        gap: 20px;
        padding: 20px 5px;
        margin-bottom: 50px;
        align-content: safe center;
        flex-wrap: wrap;

        .file_preview {
            display: flex;
            flex-direction: column;
            font-size: 1rem;
            padding: 10px;
            border-radius: 15px;
            width: 260px;
            border: 3px solid var(--dark-color);
            align-items: center;
            justify-content: center;
            gap: 10px;
            position: relative;
            min-width: 170px;
            max-width: 75vw;
            max-height: 80vh;
            height: auto;
            background: var(--primary-dark);
            mix-blend-mode: screen;
            backdrop-filter: brightness(0.3);

            &:not(:has(img)){
                min-height: 170px;
            }

            img {
                max-width: inherit;
                max-height: inherit;
                min-height: inherit;
                max-width: inherit;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                object-fit: contain;
                height: inherit;
                //background: var(--glass-color);
            }

            .close {
                position: absolute;
                top: -10px;
                right: -10px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                width: 25px;
                height: 25px;
                background: red;
                color: white !important;
                font-size: 1rem;

                &:hover {
                    filter: brightness(0.9);
                }
            }

            &:has(.error-msg:not(:empty)) {
                border: 3px solid rgb(255, 30, 30);
            }

            .icon {
                font-size: 4rem;
                padding: 15px;
                color: #ffffff9c;
                width: 100px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
            }
            .meta {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                gap: 5px;
                width: 100%;
                background: var(--glass-color);
                padding: 10px;
                border-radius: 10px;
                font-size: 0.8rem;
                white-space: nowrap;
                position: relative;
                .name,
                .size {
                    overflow: hidden;
                    width: 100%;
                    text-overflow: ellipsis;
                }
            }
        }
        .error-msg{
            font-size: 0.7rem;
            color: rgb(255, 30, 30);
            position: absolute;
            top: -20px;
            text-align: center;
            width: 100%;
        }
    }

    .filePreviewOptions {
        position: absolute;
        bottom: 10px;
        padding: 5px;
        @include flex-row-center;
        justify-content: space-between;
        width: 100%;
        font-size: 0.9rem;
        max-width: 500px;
        background: var(--primary-dark);
        width: 80%;
        border-radius: 50px;
        transition: 100ms ease-in-out;
        z-index: 1;
        filter: drop-shadow(0 4px 5px var(--shadow-color));
        .items-count{
            color: var(--light-grey-color);
        }
        * {
            font-size: inherit !important;
        }
        i {
            padding: 0;
            font-size: 1rem !important;
            color: inherit !important;
        }

        #cancel {
            color: var(--red-color);
        }

        #send{
            color: var(--secondary-dark);
        }

        button:hover {
            filter: brightness(0.9);
        }
    }
</style>
