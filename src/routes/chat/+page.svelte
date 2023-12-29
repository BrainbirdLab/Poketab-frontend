<script lang="ts">
    import { currentPage, joinedChat, currentTheme } from "$lib/store";
    import ChatPage from "$lib/components/chatUI/chatPage.svelte";
    import Form from "$lib/components/form.svelte";
    import { formNotification, formActionButtonDisabled } from "$lib/store";
    import { onMount } from "svelte";
    import { socket } from "$lib/components/socket";
    import SplashScreen from "$lib/components/splashScreen.svelte";
    import { splashMessage } from "$lib/store";

    splashMessage.set("Connecting to server...");

    export let data;
    currentTheme.set(data.themename);

    onMount(() => {
        //insert theme variables
        document.documentElement.style.setProperty("--secondary-dark", data.theme.secondary);
        document.documentElement.style.setProperty("--msg-get", data.theme.msg_get);
        document.documentElement.style.setProperty("--msg-get-reply", data.theme.msg_get_reply);
        document.documentElement.style.setProperty("--msg-send", data.theme.msg_send);
        document.documentElement.style.setProperty("--msg-send-reply", data.theme.msg_send_reply);
        document.documentElement.style.setProperty('--pattern', `url('../images/backgrounds/${data.themename}_w.webp')`);

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

</script>

{#if $splashMessage && $currentPage == "chat"}
    <SplashScreen message={$splashMessage} />
{/if}
{#if $currentPage == "chat" && $joinedChat}
    <ChatPage />
{:else}
    <Form />
{/if}