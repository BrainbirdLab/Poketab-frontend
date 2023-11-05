<script lang="ts">
    import UserInfoForm from "./userInfoForm.svelte";
    import JoinForm from "./joinForm.svelte";
    import {reconnectButtonEnabled, formNotification, showUserInputForm} from "$lib/store";
    import Notification from "./notification.svelte";
    import { onDestroy, onMount } from "svelte";
    import { authSocket } from "./authSocket";

    reconnectButtonEnabled.set(false);

    onMount(() => {
        console.log('Connecting socket - form.svelte');
        formNotification.set('');
        authSocket.connect();
    });

    onDestroy(() => {
        console.log('Disconnecting socket - form.svelte');
        formNotification.set('');
        if (authSocket.connected){
            authSocket.disconnect();
        }
    });

</script>

<Notification />

<div class="titleBar">
    <div class="text">
        <img src="/images/pikachu-mini.png" alt="Logo">
        <div class="headingText">Poketab Messenger</div>
    </div>
    <div class="subHeadingText">The coolest realtime chat app ever.</div>
</div>

{#if $showUserInputForm}
    <UserInfoForm />
{:else}
    <JoinForm />
{/if}

<style lang="scss">
    .titleBar{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

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
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 10px;
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