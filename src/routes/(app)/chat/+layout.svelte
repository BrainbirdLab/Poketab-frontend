<script lang="ts">
    import "$lib/styles/atom.css";
    import { formNotification, formActionButtonDisabled } from "$lib/store";
    import { onMount, onDestroy } from "svelte";
    import { socket } from "$lib/socket.js";
    import SplashScreen from "$lib/components/splashScreen.svelte";
    import {goto} from "$app/navigation";
    import { page } from "$app/stores";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { resetChatRoomStore } from "$lib/store";
    import { currentTheme } from "$lib/themes";
    import type { Unsubscriber } from "svelte/store";

    export let data; // Get data from load function aka +layout.server.ts

    currentTheme.set(data.theme); //Set the current theme

    let mounted = false;

    let unsubscriber: Unsubscriber;

    onMount(() => {

        unsubscriber = currentTheme.subscribe((val) => {
            const elem = document.getElementById('themesheet');
            if (!elem) {
                return;
            }
            elem.setAttribute('href', `/themes/${val}.css`);
        });

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

    onDestroy(() => {
        if (unsubscriber) {
            unsubscriber();
        }
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
<div class="chat-content">
    <slot />
</div>
{/if}

<SplashScreen />


<style>
    .chat-content{
        display: flex;
        flex-direction: column;
        justify-content: safe center;
        align-items: center;
        height: 100%;
        width: 100%;
        gap: 20px;
        position: relative;
        inset: 0;
        overflow: scroll;
    }
</style>
