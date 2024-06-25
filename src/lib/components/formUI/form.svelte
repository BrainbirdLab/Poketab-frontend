<script lang="ts">
    import InputForm from "./formComponents/inputForm.svelte";
    import JoinForm from "./formComponents/joinForm.svelte";
    import {reconnectButtonEnabled, showUserInputForm} from "$lib/store";
    import Notification from "./formComponents/notification.svelte";
    import { onMount } from "svelte";
    import { socket } from "$lib/socket";
    
    reconnectButtonEnabled.set(false);
    
    onMount(() => {
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
