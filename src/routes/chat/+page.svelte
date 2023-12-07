<script lang="ts">
    import { currentPage, currentTheme, joinedChat } from "$lib/store";
    import ChatPage from "./chatUI/chatPage.svelte";
    import Form from "../form.svelte";
    import { formNotification, formActionButtonDisabled } from "$lib/store";
    import { onMount } from "svelte";
    import { socket } from "../socket";
    import SplashScreen from "../splashScreen.svelte";
    import { splashMessage } from "$lib/store";

    splashMessage.set("Connecting to server...");

    export let data;

    currentTheme.set(data.theme);

    onMount(() => {
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

    console.log("Chat page");
</script>

<svelte:head>
    <link rel="stylesheet" href="/themes/{$currentTheme}.css" />
</svelte:head>

{#if $splashMessage && $currentPage == "chat"}
    <SplashScreen message={$splashMessage} />
{/if}
{#if $currentPage == "chat" && $joinedChat}
    <ChatPage />
{:else}
    <Form />
{/if}
