<script lang="ts">

    import { page } from "$app/stores";
    import { generateId } from "$lib/utils";

    let image: HTMLImageElement;

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
    <!-- use the img as image element -->
    <img bind:this={image} src={$page.state.viewImage.src} data-ref-id="{$page.state.viewImage.id}" data-ref-name="{$page.state.viewImage.name}" alt="Could not load" class="main-image"/>
    {:else}
        No longer available
    {/if}
</div>

<style lang="scss">
    
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



        .main-image{
            position: absolute;
            max-width: 100%;
            max-height: 100%;
        }
    }

</style>