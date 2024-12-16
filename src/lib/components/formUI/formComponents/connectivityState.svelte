<script lang="ts">
    import {fly} from "svelte/transition";
    import {formActionButtonDisabled, formNotification} from "$lib/store.svelte";
    import { socket } from "$lib/connection/socketClient";
    import { onDestroy } from "svelte";

    let connected = $state('');

    const unsub = formNotification.onChange((value) => {
        if (value.includes('offline')){
            //make the background red
            connected = '';
        } else if (value.includes('online')){
            connected = 'online';
            if (socket.disconnected){
                socket.connect();
                setTimeout(() => {
                    if (value.toLocaleLowerCase().includes('connected')){
                        return;
                    }
                    formNotification.value = 'Connecting to server...';
                }, 1000);
            } else{
                setTimeout(() => {
                    formNotification.value = '';
                }, 1000);
                formActionButtonDisabled.value = false;
            }
        } else if (value == 'Connected to server') {
            //make the background green
            connected = 'connected';
        } else {
            connected = '';
        }
    })

    onDestroy(() => {
        unsub();
    })

</script>

{#if formNotification.value != ''}
<div class="notification {connected}" transition:fly={{y: -10}}>
    {formNotification.value} 
</div>
{/if}

<style lang="scss">

    .notification{
        position: fixed;
        z-index: 100;
        color: var(--text-color);
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