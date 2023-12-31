<script lang="ts">
    import { formNotification, formActionButtonDisabled, currentTheme } from "$lib/store";
    import { onMount } from "svelte";
    import { socket } from "$lib/components/socket";
    import SplashScreen from "$lib/components/splashScreen.svelte";
    import { splashMessage } from "$lib/store";
    import {goto} from "$app/navigation";
    import { page } from "$app/stores";

    export let data;

    currentTheme.set(data.theme);

    splashMessage.set("Connecting to server...");

    let mounted = false;

    onMount(() => {

        if ($page.route.id !== '/chat'){
            console.log("Redirecting to /chat");
            goto('/chat');
        }

        //on offline
        window.addEventListener("offline", () => {
            console.log("Offline");
            socket.disconnect();
            formNotification.set("You are offline");
            formActionButtonDisabled.set(true);
        });

        //on online
        window.addEventListener("online", () => {
            console.log("Online");
            formNotification.set("Back to online");
        });

        mounted = true;
        console.log("Mounted chat +layout.svelte");
    });

</script>

{#if mounted}    
    <slot />
{:else}
    <SplashScreen />
{/if}