<script lang="ts">
    import { onMount } from "svelte";
    import {fly} from "svelte/transition";
    import {socket} from "$lib/components/socket";

    let title = '';
    let icon = '';
    export let offline = false;
    
    onMount(()=>{

        let retry = 1;

        //on offline
        window.addEventListener('offline', () => {
            //console.log('Offline - conectivityState.svelte');
            title = 'You are offline';
            offline = true;
            icon = 'fa-circle-exclamation';
            retry = 1;
            socket.disconnect();
        });

        socket.on('connect', ()=>{
            //console.log('Connected - conectivityState.svelte');
            retry = 1;

            if (title == ''){
                return;
            }

            title = 'Connected';
            icon = 'fa-wifi';
            setTimeout(() => {
                title = '';
            }, 2000);
        });

        socket.on('connection_error', () => {
            //console.log('Connection error - conectivityState.svelte');
            title = 'Could not connect. Retrying... ' + retry++;
            icon = 'fa-circle-exclamation';
        });

        //on online
        window.addEventListener('online', () => {
            //console.log('Back to Online - conectivityState.svelte');
            title = 'Back to online';
            offline = false;
            icon = 'fa-wifi';
            retry = 1;
            socket.connect();
        });
    });

</script>

{#if title}    
<div class="container" transition:fly={{y: 20, duration: 100}}>
    <div class="content">
        <div class="title">
            <i class="icon fa-solid {icon}"></i>
            {title}
        </div>
    </div>
</div>
{/if}



<style lang="scss">
    .container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        width: 100%;
        gap: 10px;
        position: fixed;
        bottom: 60px;
        
        z-index: 1000;
        
        i {
            color: inherit !important;
        }
        
        .content{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: var(--primary-dark);
            padding: 8px 50px;
            border-radius: 10px;

            
            .title{
                font-size: 0.8rem;
            }
        }

        .content:has(i.fa-wifi){
            background: lime;
        }
    }
</style>