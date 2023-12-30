<script lang="ts">
    import { currentPage, joinedChat } from "$lib/store";
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Form from "$lib/components/form.svelte";
    import { formNotification, formActionButtonDisabled } from "$lib/store";
    import { onMount } from "svelte";
    import { socket } from "$lib/components/socket";
    import SplashScreen from "$lib/components/splashScreen.svelte";
    import { splashMessage } from "$lib/store";
    import {goto} from "$app/navigation";
    import { page } from "$app/stores";

    splashMessage.set("Connecting to server...");

    let mounted = false;

    onMount(() => {

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

        mounted = true;
        console.log("Mounted +layout.svelte");
    });

</script>

{#if mounted}    
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
{/if}

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