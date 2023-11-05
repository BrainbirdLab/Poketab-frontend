<script lang="ts">
    import { isConnected } from "$lib/store";
    import ChatPage from "./chatUI/chatPage.svelte";
    import Form from "../form.svelte";
    import { formNotification, formActionButtonDisabled } from "$lib/store";
    import { onMount } from "svelte";
    import { authSocket } from "../authSocket";

    onMount(()=>{
        //on offline
        window.addEventListener('offline', () => {
            console.log('Offline');
            authSocket.disconnect();
            formNotification.set('You are offline');
            //connected = '';
            //reconnectButtonEnabled.set(true);
            formActionButtonDisabled.set(true);
        });

        //on online
        window.addEventListener('online', () => {
            console.log('Online');
            formNotification.set('Back to online');
            /*
            connected = 'online';
            setTimeout(() => {
                formNotification.set('Connecting to server...');
            }, 1000);
            */
        });
    });

</script>

{#if !$isConnected}
    <!-- Show form -->
    <Form />
{:else}
    <ChatPage />
{/if}