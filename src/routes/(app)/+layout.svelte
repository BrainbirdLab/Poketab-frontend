
<script lang="ts">
    import "$lib/styles/global.scss";
    console.log("Mounted root +layout.svelte");

    function removeAttribute(evt: MouseEvent | TouchEvent) {
        const element = evt.target as HTMLElement;
        element.removeAttribute("data-pressed");
        //console.log("remove data-pressed");
    }

    function handleClick(event: MouseEvent | TouchEvent) {

        const target = event.target as HTMLElement;

        if (target.classList.contains('button-animate')){
            target.setAttribute("data-pressed", "true");
            //console.log("add data-pressed");
            //if mouse event, add listener for mouseleave
            if (event instanceof MouseEvent) {
                target.addEventListener("mouseleave", removeAttribute, { once: true });
            } else {
                //if touch event, add listener for touchend
                target.addEventListener("touchend", removeAttribute, { once: true });
            }
        }
        if (target.classList.contains('play-sound')){
            //console.log("play sound");
            const audio = new Audio("/sounds/click.mp3");
            audio.play();
        }
    }
</script>

<svelte:body 
on:contextmenu|preventDefault
on:mousedown={handleClick}
on:touchstart={handleClick}
/>

<div class="maincontainer">
    <slot />
</div>

<style lang="scss">
    .maincontainer {
        background: rgba(0, 0, 0, 0.6117647059) var(--pattern);
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
        //overflow: scroll;
    }
</style>