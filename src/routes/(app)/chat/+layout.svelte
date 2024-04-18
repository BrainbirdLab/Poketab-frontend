<script lang="ts">
    import "$lib/styles/atom.css";
    import { formNotification, formActionButtonDisabled, currentTheme } from "$lib/store";
    import { onMount } from "svelte";
    import { socket } from "$lib/components/socket";
    import SplashScreen from "$lib/components/splashScreen.svelte";
    import {goto} from "$app/navigation";
    import { page } from "$app/stores";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { resetChatRoomStore } from "$lib/store";
    import { loadChatSettings } from "$lib/components/chatUI/chatComponents/quickSettingsModal.svelte";

    export let data; // Get data from load function aka +layout.server.ts

    currentTheme.set(data.theme); //Set the current theme

    let mounted = false;

    onMount(() => {

        loadChatSettings();

        if ($page.route.id !== '/chat'){
            goto('/chat');
        }

        mounted = true;

        let interval: number;

        socket.on('maintainanceBreak', (message: string, time: number) => {
            //time seconds later connection will be closed.

            showToastMessage(message, 3000);
            interval = setInterval(() => {
                if (time > 0) {
                    showToastMessage(`Connection will be closed in ${--time} seconds`, 2000);
                } else {
                    socket.disconnect();
                    resetChatRoomStore(message + '. Connection closed 😢');
                    clearInterval(interval);
                }
            }, 1000);
        });
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

<svelte:head>
    <link rel="stylesheet" href="/themes/{$currentTheme}.css">
</svelte:head>

{#if mounted}    
    <slot />
{/if}

<SplashScreen />
