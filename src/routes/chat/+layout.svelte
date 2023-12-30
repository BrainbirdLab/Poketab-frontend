<script lang="ts">
    import { currentPage, joinedChat, currentTheme } from "$lib/store";
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Form from "$lib/components/form.svelte";
    import { formNotification, formActionButtonDisabled } from "$lib/store";
    import { onDestroy, onMount } from "svelte";
    import { socket } from "$lib/components/socket";
    import SplashScreen from "$lib/components/splashScreen.svelte";
    import { splashMessage } from "$lib/store";
    import type { Unsubscriber } from "svelte/store";
    import { themes } from "$lib/themes";
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";

    splashMessage.set("Connecting to server...");

    let unsubTheme: Unsubscriber;

    onMount(() => {
        //insert theme variables
        unsubTheme = currentTheme.subscribe((val) => {
            console.log(`Theme ${val} applied`);
            document.documentElement.style.setProperty("--secondary-dark", themes[val].secondary);
            document.documentElement.style.setProperty("--msg-get", themes[val].msg_get);
            document.documentElement.style.setProperty("--msg-get-reply", themes[val].msg_get_reply);
            document.documentElement.style.setProperty("--msg-send", themes[val].msg_send);
            document.documentElement.style.setProperty("--msg-send-reply", themes[val].msg_send_reply);
            document.documentElement.style.setProperty('--pattern', `url('/images/backgrounds/${val}_w.webp')`);
        });

        if ($page.route.id !== '/chat'){
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
    
    });

    onDestroy(() => {
        if (unsubTheme) {
            unsubTheme();
        }
    });

</script>

<div class="content">
    {#if $splashMessage && $currentPage == "chat"}
        <SplashScreen message={$splashMessage} />
    {/if}
    {#if $currentPage == "chat" && $joinedChat}
        <ChatInterface />
    {:else}
        <Form />
    {/if}
</div>

<slot />

<style lang="scss">
    .content{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        background: rgba(0, 0, 0, 0.6117647059) var(--pattern);
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>