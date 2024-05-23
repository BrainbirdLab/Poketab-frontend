<script lang="ts">

    import { page } from "$app/stores";

    import { PanZoom } from "$lib/panzoom";
    import { onMount } from "svelte";

    let image: HTMLImageElement;

    function closeLightbox(){
        console.log('closeLightbox');
        history.back();
    }

    function downloadImage(){
        console.log('downloadImage');
    }

    onMount(() => {
        PanZoom(image);
    });

</script>

<div class="lightbox">
    <button class="close hoverShadow" on:click={closeLightbox}>
        <!-- back arrow -->
        <i class="fa-solid fa-arrow-left"></i>
    </button>
    <button class="download hoverShadow" on:click={downloadImage}>
        <i class="fa-solid fa-download"></i>
    </button>
    <!-- use the img as image element -->
    <img bind:this={image} src={$page.state.viewImage} alt="Could not load" class="main-image"/>
</div>

<style lang="scss">
    
    .lightbox{
        position: fixed;
        inset: 0;
        background-color: var(--modal-color);
        backdrop-filter: blur(2px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 100;
        overflow: hidden;
        width: 100%;
        height: 100%;

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
        }
    }

</style>