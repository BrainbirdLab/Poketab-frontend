<script lang="ts">
    import {fly} from "svelte/transition";
    import {socket} from "$lib/components/socket";

    let title = '';
    let icon = '';
    export let offline = false;
    
    let retry = 1;

    socket.on('connect', ()=>{

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

        title = 'Could not connect. Retrying... ' + retry++;
        icon = 'fa-circle-exclamation';
    });

    function handleOffline(){
        title = 'You are offline';
        offline = true;
        icon = 'fa-circle-exclamation';
        retry = 1;
        socket.disconnect();
    }

    function handleOnline(){
        title = 'Back to online';
        offline = false;
        icon = 'fa-wifi';
        retry = 1;
        socket.connect();
    }

</script>

<svelte:window  on:online={handleOnline} on:offline={handleOffline}/>

{#if title}    
<div class="container" transition:fly={{y: 20, duration: 100}}>
    <div class="content back-blur">
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
        height: 100%;
        inset: 0;
        gap: 10px;
        position: fixed;
        //shadow
        
        z-index: 1000;
        
        i {
            color: inherit !important;
        }
        
        .content{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: var(--modal-color);
            padding: 8px 50px;
            border-radius: 10px;
            box-shadow: 2px 2px 10px 0px rgba(0,0,0,0.75);
            position: absolute;
            bottom: 60px;
            
            .title{
                font-size: 0.8rem;
            }
        }

        .content:has(i.fa-wifi){
            background: lime;
        }
    }
</style>