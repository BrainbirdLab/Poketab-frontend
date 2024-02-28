<script lang="ts">
    import "$lib/styles/atom.css";
    import { formNotification, formActionButtonDisabled, currentTheme } from "$lib/store";
    import { onMount } from "svelte";
    import { socket } from "$lib/components/socket";
    import SplashScreen from "$lib/components/splashScreen.svelte";
    import {goto} from "$app/navigation";
    import { page } from "$app/stores";

    export let data; // Get data from load function aka +layout.server.ts

    currentTheme.set(data.theme); //Set the current theme

    let mounted = false;

    onMount(() => {

        if ($page.route.id !== '/chat'){
            console.log("Redirecting to /chat");
            goto('/chat');
        }

        mounted = true;
        console.log("Mounted chat +layout.svelte");
    });

</script>

<svelte:window 

    on:offline={() => {
        console.log("Offline");
        //disconnect the socket connection
        socket.disconnect();
        /**
         * The Disconnection event listener will set the formNotification to "Disconnected from server"
         * But we want to show "You are offline" instead
        */
        formNotification.set("You are offline"); // So, we set it here
        formActionButtonDisabled.set(true); //disable the form action button
    }}

    on:online={() => {
        console.log("Online");
        formNotification.set("Back to online"); //Set the formNotification to "Back to online"
    }}
/>

{#if mounted}    
    <slot />
{/if}

<SplashScreen />
