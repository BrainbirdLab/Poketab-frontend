<script lang="ts">

    import "$lib/styles/global.scss";

    import { onMount } from "svelte";
    import { playClickSound } from "$lib/utils";
    import NavigationIndicator from "$lib/components/NavigationIndicator.svelte";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { deviceType } from "$lib/store";
    import { loadChatSettings } from "$lib/components/chatUI/chatComponents/quickSettingsModal.svelte";

    async function detectSWUpdate(){
        if (!("serviceWorker" in navigator)) return;
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

    function detectDeviceType() {
        //detect if mobile or desktop
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        deviceType.set(isMobile ? "mobile" : "desktop");
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
                target.addEventListener("mouseup", removeAttribute, {
                    once: true,
                });
            } else {
                //if touch event, add listener for touchend
                target.addEventListener("touchend", removeAttribute, {
                    once: true,
                });
                target.addEventListener("touchcancel", removeAttribute, {
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
        detectDeviceType();
    });

</script>

<svelte:body on:contextmenu|preventDefault on:click={handleClick} />

<NavigationIndicator />

<div class="maincontainer">
    <slot />
</div>

<style lang="scss">

    .maincontainer {
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 20px;
        min-height: 100%;
        height: 100%;
        width: 100%;
        position: fixed;
        inset: 0;
    }
</style>
