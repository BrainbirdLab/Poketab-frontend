<script lang="ts">
    import InputForm from "./formComponents/inputForm.svelte";
    import JoinForm from "./formComponents/joinForm.svelte";
    import {reconnectButtonEnabled, showUserInputForm} from "$lib/store.svelte";
    import Notification from "./formComponents/connectivityState.svelte";
    import { onMount } from "svelte";
    import { socket } from "$lib/connection/socketClient";
    
    reconnectButtonEnabled.value = false;
    
    onMount(() => {
        if (socket.disconnected){
            console.log('Connecting to server...');
            socket.connect();
        }
    });

</script>

<Notification />

{#if showUserInputForm.value}
    <InputForm />
{:else}
    <JoinForm/>
{/if}
