
<script lang="ts">
    import {fly} from "svelte/transition";
    import {formActionButtonDisabled, formNotification} from "$lib/store";
    import { socket } from "../lib/components/socket";
    import { onDestroy } from "svelte";

    let connected = '';

    onDestroy(() => {
        unsub();
    });

    const unsub = formNotification.subscribe(value => {

        if (value.includes('offline')){
            //make the background red
            connected = '';
        } else if (value.includes('online')){
            connected = 'online';
            if (socket.disconnected){
                console.log('Connecting to server...');
                socket.connect();
                setTimeout(() => {
                    if ($formNotification.toLocaleLowerCase().includes('connected')){
                        return;
                    }
                    formNotification.set('Connecting to server...');
                }, 1000);
            } else{
                setTimeout(() => {
                    formNotification.set('');
                }, 1000);
                formActionButtonDisabled.set(false);
            }
        } else if (value.includes('Could not connect')){
            connected = '';
        } else if (value == 'Connected to server') {
            //make the background green
            connected = 'connected';
        }
    });

</script>

{#if $formNotification != ''}
<div class="notification {connected}" transition:fly={{y: -10}}>
    {$formNotification} 
</div>
{/if}

<style lang="scss">

    .notification{
        position: fixed;
        z-index: 100;
        color: var(--foreground-dark);
        font-size: 0.8rem;
        background: orangered;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 2px;
        top: 0;
        &.connected{
            background: lime;
        }
        &.online{
            background: mediumseagreen;
        }
    }
</style>