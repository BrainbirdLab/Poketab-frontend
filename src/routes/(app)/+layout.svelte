<script lang="ts">
    import "$lib/styles/global.scss";
    import { playClickSound } from "$lib/utils";
    import NavigationIndicator from "$lib/components/NavigationIndicator.svelte";
    import { loadChatSettings } from "$lib/components/chatUI/chatComponents/quickSettingsModal.svelte";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { onMount } from "svelte";

    async function detectSWUpdate(){
        const registration = await navigator.serviceWorker.ready;

        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            newWorker?.addEventListener("statechange", () => {
                if (newWorker.state === "installed") {
                    newWorker.postMessage({ type: "SKIP_WAITING" });
                    showToastMessage("App updated");
                }
            });
        });
    }

    function removeAttribute(evt: MouseEvent | TouchEvent) {
        const element = evt.target as HTMLElement;
        element.removeAttribute("data-pressed");
    }


    function handleClick(event: MouseEvent | TouchEvent) {
        const target = event.target as HTMLElement;

        if (target.classList.contains("button-animate")) {
            target.setAttribute("data-pressed", "true");
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
            playClickSound();
        }
    }

    onMount(() => {
        loadChatSettings();
        detectSWUpdate();
    });

</script>

<svelte:body on:contextmenu|preventDefault on:click={handleClick} />

<NavigationIndicator />

<div class="maincontainer">
    <slot />
</div>

<style lang="scss">

    .maincontainer {
        background: rgba(0, 0, 0, 0.6117647059) var(--pattern);
        transition: background 500ms;
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        text-align: justify;
        gap: 20px;
        min-height: 100%;
        height: 100%;
        width: 100%;
        position: relative;
        inset: 0;
    }
</style>
