<script lang="ts">
    import { currentPage, currentTheme, joinedChat } from "$lib/store";
    import ChatPage from "./chatUI/chatPage.svelte";
    import Form from "../form.svelte";
    import { formNotification, formActionButtonDisabled } from "$lib/store";
    import { onMount } from "svelte";
    import { socket } from "../socket";
    import SplashScreen from "../splashScreen.svelte";
    import { splashMessage } from "$lib/store";

    splashMessage.set('Connecting to server...');

    export let data;

    currentTheme.set(data.theme);
  
    onMount(()=>{
        //on offline
        window.addEventListener('offline', () => {
            console.log('Offline');

            socket.disconnect();
            formNotification.set('You are offline');
            //connected = '';
            //reconnectButtonEnabled.set(true);
            formActionButtonDisabled.set(true);
        });

        //on online
        window.addEventListener('online', () => {
            console.log('Online');

            formNotification.set('Back to online');
        });
    });

</script>

<svelte:head>
    <meta name="theme-color" content="#111d2a" />
    <meta name="title" content="Poketab Messenger" />
    <meta name="description"
    content="This is a temporary instant messaging app where you can chat also in groups. There is no database so any of your chat is not stored. ">
    <meta property="og:title" content="Instant Messaging App" />
    <meta property="og:description"
    content="This is a temporary instant messaging app where you can chat also in groups. There is no database so any of your chat is not stored. ">
    <meta property="og:image" content="cover.png" />

    <link rel="apple-touch-icon" href="icons/apple-icon-180.png">

    <meta name="apple-mobile-web-app-capable" content="yes">
    <link rel="stylesheet" href="/styles/themes/{$currentTheme}.css">
</svelte:head>

{#if $splashMessage && $currentPage == 'chat'}
<SplashScreen message={$splashMessage}/>
{/if}

{#if $currentPage == 'chat' && $joinedChat}
<ChatPage />
{:else}
<!-- Show form -->
<Form />
{/if}