<script lang="ts">
    import "$lib/styles/atom.css";
    import { onMount, onDestroy } from "svelte";
    import { socket } from "$lib/connection/socketClient";
    import SplashScreen from "$lib/components/splashScreen.svelte";
    import {goto} from "$app/navigation";
    import { page } from "$app/state";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import { resetChatRoomStore, formNotification, formActionButtonDisabled } from "$lib/store.svelte";
    import { themes } from "$lib/themesTypes";
    import { currentTheme } from "$lib/settings.svelte";
    import type { Unsubscriber } from "svelte/store";

    let { data, children } = $props();

    currentTheme.value = data.theme; //Set the current theme

    let mounted = $state(false);

    let unsubscriber: Unsubscriber;

    onMount(() => {
        
        if (!navigator.onLine){
            handleOffline();
        }

        unsubscriber = currentTheme.onChange((val) => {
            const elem = document.getElementById('theme-css');
            if (!elem) {
                return;
            }
            elem.setAttribute('href', `/themes/${val}.css`);
            
            const themeAccent = document.getElementById('theme-color');
            if (!themeAccent) {
                return;
            }

            themeAccent.setAttribute('content', themes[val].accentColor);
        });

        if (page.route.id !== '/chat'){
            goto('/chat');
        }

        mounted = true;

        let interval: number | NodeJS.Timeout;

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

    function handleOffline() {
        console.log("Offline");
        /**
         * The Disconnection event listener will set the formNotification to "Disconnected from server"
         * But we want to show "You are offline" instead
        */
        formNotification.value = "You are offline"; // So, we set it here
        formActionButtonDisabled.value = true; //disable the form action button
        //disconnect the socket connection
        socket.disconnect();
    }

</script>

<svelte:window 

    onoffline={handleOffline}

    ononline={() => {
        console.log("Online");
        formNotification.value = "Back to online"; //Set the formNotification to "Back to online"
        socket.connect(); //Reconnect the socket connection
    }}
/>

{#if mounted}    
<div class="chat-content">
    {@render children?.()}
</div>
{/if}

<SplashScreen />


<style>
    .chat-content{
        background: rgba(0, 0, 0, var(--fade)) var(--pattern);
        transition: background 500ms;
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
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
