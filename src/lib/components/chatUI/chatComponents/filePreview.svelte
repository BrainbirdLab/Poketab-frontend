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
           return 'Should be < 10 Mb';
        }

        if (sendAs == 'audio') {
            const supportedAudioFormats = ['audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/x-m4a'];
            if (!supportedAudioFormats.includes(file.type)) {
                return 'Cannot send as audio';
            }
        } else if (sendAs == 'image') {
            const supportedImageFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!supportedImageFormats.includes(file.type)) {
                return 'Cannot send as image';
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
            class="file_preview back-blur"
            data-id={i}
        >
            {#if sendAs === 'image'}
                <img src={createURLObject(file)} alt="preview" />
            {:else}
            <i class="icon fa-solid {getIcon(file.type)}"></i>
            {/if}
            <div class="meta">
                <div class="info">
                    <div class="name">{file.name}</div>
                    <div class="size" class:error={fileIsAcceptable(file)}>
                        
                        {#if fileIsAcceptable(file)}
                            {getSize(file.size)} - {fileIsAcceptable(file)}
                        {:else}
                            {getSize(file.size)}
                        {/if}
                    </div>
                </div>
                <i class="close remove fa-solid fa-trash"></i>
            </div>
        </div>
    {/each}
</div>
<div class="filePreviewOptions back-blur" transition:fly={{y: 10}}>
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
            aspect-ratio: 4/3;
            border-radius: 15px;
            width: 300px;
            border: 3px solid var(--dark-color);
            align-items: center;
            justify-content: center;
            //gap: 10px;
            position: relative;
            min-width: 150px;
            max-height: 80vh;
            height: auto;
            background: var(--modal-color);
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
                border-radius: 12px 12px 0 0;
                object-fit: contain;
                height: inherit;
                //background: var(--glass-color);
            }

            &:has(.error-msg:not(:empty)) {
                border: 3px solid rgb(255, 30, 30);
            }

            .icon {
                font-size: 4rem;
                //padding: 15px;
                color: #ffffff9c;
                width: 100px;
                height: 100px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                margin: auto 0;
            }
            .meta {
                display: grid;
                grid-template-columns: 1fr 0.3fr;
                gap: 5px;
                width: 100%;
                background: var(--glass-color);
                border-radius: 0 0 10px 10px;
                font-size: 0.8rem;
                position: relative;
                .info{
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    white-space: nowrap;
                    padding: 10px;
                    overflow: hidden;
                    .name,
                    .size {
                        overflow: hidden;
                        width: 100%;
                        text-overflow: ellipsis;
                    }
                    .size{
                        color: var(--secondary-dark);
                        &.error{
                            color: orangered;
                        }
                    }
                }

                .close {
                    //border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    width: 100%;
                    height: 100%;
                    min-width: 64px;
                    border-top-right-radius: inherit;
                    border-bottom-right-radius: 12px;
                    background: rgba(255, 0, 0, 0.622);
                    color: rgb(255, 255, 255) !important;
                    font-size: 1rem;

                    &:hover {
                        filter: brightness(0.9);
                    }
                }
            }
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
        background: var(--modal-color);
        width: 80%;
        border-radius: 50px;
        transition: 100ms ease-in-out;
        z-index: 1;
        box-shadow: 10px 10px 35px var(--shadow-color);
        * {
            font-size: inherit !important;
        }
        .items-count{
            color: var(--blue-grey-color);
            text-align: center;
            font-size: 0.75rem !important;
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
