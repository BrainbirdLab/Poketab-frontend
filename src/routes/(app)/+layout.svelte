<script lang="ts">
    import "$lib/styles/global.scss";
    import { playClickSound } from "$lib/utils";
    import { navigating } from "$app/stores";
    console.log("Mounted root +layout.svelte");

    function removeAttribute(evt: MouseEvent | TouchEvent) {
        const element = evt.target as HTMLElement;
        element.removeAttribute("data-pressed");
        //console.log("remove data-pressed");
    }

    function handleClick(event: MouseEvent | TouchEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains("button-animate")) {
            target.setAttribute("data-pressed", "true");
            //console.log("add data-pressed");
            //if mouse event, add listener for mouseleave
            if (event instanceof MouseEvent) {
                target.addEventListener("mouseleave", removeAttribute, {
                    once: true,
                });
            } else {
                //if touch event, add listener for touchend
                target.addEventListener("touchend", removeAttribute, {
                    once: true,
                });
            }
        }
        if (target.classList.contains("play-sound")) {
            //console.log("play sound");
            playClickSound();
        }
    }
</script>

<svelte:body on:contextmenu|preventDefault on:click={handleClick} />

{#if !!$navigating}
    <div class="navigationIndicator"></div>
{/if}

<div class="maincontainer">
    <slot />
</div>

<style lang="scss">
    .navigationIndicator {
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: var(--secondary-dark);
        animation: navigate 5s;
        z-index: 100;
    }

    @keyframes navigate {
        /* fast width from 0 to 50% in 1s */
        0% {
            width: 0;
        }
        25% {
            width: 50%;
        }
        /* slow width from 50% to 100% in 5s */
        90% {
            width: 95%;
        }
        100% {
            width: 95%;
        }
    }

    .maincontainer {
        background: rgba(0, 0, 0, 0.6117647059) var(--pattern);
        transition: background 1s 200ms;
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        text-align: justify;
        gap: 20px;
        height: 100%;
        width: 100%;
        inset: 0;
        //overflow: scroll;
    }
</style>
