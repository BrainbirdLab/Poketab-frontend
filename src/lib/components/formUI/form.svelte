<script lang="ts">
    import InputForm from "./formComponents/inputForm.svelte";
    import JoinForm from "./formComponents/joinForm.svelte";
    import {reconnectButtonEnabled, showUserInputForm} from "$lib/store";
    import Notification from "./formComponents/notification.svelte";
    import { onMount } from "svelte";
    import { socket } from "$lib/socket";
    import { fly, scale } from "svelte/transition";

    let mounted = false;
    
    reconnectButtonEnabled.set(false);
    
    onMount(() => {
        //formNotification.set('');
        mounted = true;
        if (socket.disconnected){
            console.log('Connecting to server...');
            socket.connect();
        }
    });

</script>

<Notification />

{#if $showUserInputForm}
    <InputForm />
{:else}
    <JoinForm/>
{/if}
