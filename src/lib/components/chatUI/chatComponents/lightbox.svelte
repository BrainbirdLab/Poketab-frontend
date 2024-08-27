<script lang="ts">

    import Panzoom from "@panzoom/panzoom";
    import { page } from "$app/stores";
    import { generateId } from "$lib/utils";
    import { onMount } from "svelte";

    let image: HTMLImageElement;
    let im: HTMLDivElement;

    function closeLightbox(){
        history.back();
    }

    function downloadImage(){
        const a = document.createElement('a');
        a.href = image.src;
        const name = image.getAttribute('data-ref-name') || 'image-' + generateId(16);

        a.download = name;

        a.click();
    }

    onMount(() => {
        const p = Panzoom(im);
        p.setOptions({
            minScale: 1,
            maxScale: 5,
        });
        if (im.parentElement) {
            im.addEventListener('wheel', p.zoomWithWheel);
            //reset on double click or double tap
            let lastClick = 0;
            im.addEventListener('click', (e) => {
                const now = new Date().getTime();
                if (now - lastClick < 300) {
                    p.reset();
                }
                lastClick = now;
            });
        }
    });

</script>

<div class="lightbox">
    {#if $page.state.viewImage?.id}
    <button class="close hoverShadow" on:click={closeLightbox}>
        <!-- back arrow -->
        <i class="fa-solid fa-arrow-left"></i>
    </button>
    <button class="download hoverShadow" on:click={downloadImage}>
        <i class="fa-solid fa-download"></i>
    </button>
    <div class="imgWrapper" bind:this={im}>
        <!-- use the img as image element -->
        <img bind:this={image} src={$page.state.viewImage.src} data-ref-id="{$page.state.viewImage.id}" data-ref-name="{$page.state.viewImage.name}" alt="Could not load" class="main-image"/>
    </div>
    {:else}
        No longer available
    {/if}
</div>

<style lang="scss">

    .imgWrapper{
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .main-image{
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
    
    .lightbox{
        position: fixed;
        inset: 0;
        background-color: var(--modal-color);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
        overflow: hidden;
        width: 100%;
        height: 100%;

        backdrop-filter: blur(2px);

        button{
            position: fixed;
            top: 0;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            z-index: 1;

            &.download{
                right: 0;
            }

            &.close{
                left: 0;
                i{
                    color: var(--secondary-dark);
                }
            }
        }
    }

</style>