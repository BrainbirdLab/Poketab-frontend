<script lang="ts">
    import InputForm from "./inputForm.svelte";
    import JoinForm from "./joinForm.svelte";
    import {reconnectButtonEnabled, formNotification, showUserInputForm} from "$lib/store";
    import Notification from "./notification.svelte";
    import { onMount } from "svelte";
    import { socket } from "./socket";
    import { fly, scale } from "svelte/transition";

    let mounted = false;
    
    reconnectButtonEnabled.set(false);
    onMount(() => {
        formNotification.set('');
        mounted = true;
        if (socket.disconnected){
            console.log('Connecting to server...');
            socket.connect();
        }
    });
    

    export let errLog = '';
    export let errIcon = '';

</script>

<Notification />

{#if mounted}
<div class="titleBar" transition:fly={{y:-20}}>
    <img src="/images/pikachu-mini.png" alt="Logo" transition:scale>
    <div class="text">
        <div class="headingText">Poketab Messenger</div>
        <div class="subHeadingText" transition:fly={{x: -10, delay: 300}}>The cutest realtime chat app ever.</div>
    </div>
</div>
{/if}

{#if $showUserInputForm}
    <InputForm />
{:else}
    <JoinForm errIcon={errIcon} errLog={errLog}/>
{/if}

<style lang="scss">
    .titleBar{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 10px;
        position: fixed;
        top: 20px;
        left: 0;
        width: 100%;

        img{
            width: 50px;
            height: 50px;
        }

        .text{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            .headingText{
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--foreground-dark);
            }

        }
        .subHeadingText{
            font-size: 0.8rem;
            color: var(--foreground-dark);
            opacity: 0.5;
        }
    }
</style>