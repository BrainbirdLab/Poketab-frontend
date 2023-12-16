<script lang="ts">
    import { fly } from "svelte/transition";

    import {socket, reConnectSocket} from "../lib/components/socket";
    import {formNotification, reconnectButtonEnabled, socketConnected, type User} from "$lib/store";

    import {formActionButtonDisabled, chatRoomStore, showUserInputForm} from "$lib/store";

    let key = '';

    function testKey(k: string){
        return /^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{2}$/.test(k);
    }

    function validateKey(e: KeyboardEvent) {
        if (!e.ctrlKey && e.key != 'v'){
            e.preventDefault();
        }
        if (e.key == 'Enter') {
            checkKey();
        } else if (/^[a-zA-Z0-9]$/.test(e.key) && key.length < 9) {
            // Only allow letters and numbers
            if (key.length == 2 || key.length == 6) {
                key += '-';
            }
            key += e.key;
        } else if (e.key == 'Backspace') {
            if (key.length > 0) {
                // Remove '-' if the previous character is '-'
                if (key.at(-2) == '-') {
                    key = key.slice(0, -2);
                } else {
                    key = key.slice(0, -1);
                }
            }
        }
    }

    function parseKey(e: ClipboardEvent){
        //console.log('Parsing key');
        e.preventDefault();
        //convert abcedfg to ab-cde-fg
        let value = e.clipboardData?.getData('text/plain');
        if (!value) return;

        if (value.length == 7){
            value = value.slice(0, 2) + '-' + value.slice(2, 5) + '-' + value.slice(5, 7);
        }
        if (testKey(value)){
            key = value;
            checkKey();
        }
    }

    export let errLog = '';
    export let errIcon = '';
    let errAnimation = '';
    let LabelText = 'Enter key';
    let LabelIcon = 'fa-solid fa-key';

    $: {
        if (errLog){
            errAnimation = 'shake';
            //console.log('Shaking');
            setTimeout(() => {
                errAnimation = '';
            }, 100);
        }else{
            errAnimation = '';
        }
    }

    let joinActionText = 'Join Chat';

    type fetchResponse = {
        success: boolean,
        message: string,
        statusCode: number,
        icon: string,
        users: {[key: string]: User},
        maxUsers: number,
    }

    function checkKey(){
        console.log('Checking key');

        errLog = '';

        if (!key){
            console.log('Key is empty');
            errLog = 'Key is required';
            errIcon = 'fa-solid fa-triangle-exclamation';
            return;
        }else{
            errLog = '';
        }

        if (!testKey(key)){
            console.log('Invalid key', key);
            errLog = 'Invalid key';
            errIcon = 'fa-solid fa-triangle-exclamation';
            return;
        }else{
            errLog = '';
        }

        joinActionText = 'Checking...';
        formActionButtonDisabled.set(true);

        errIcon = '';

        console.log('Fetching key data');

        socket.emit('fetchKeyData', key, (res: fetchResponse) => {

            joinActionText = 'Join Chat';
            //joinActionDisabled = false;
            formActionButtonDisabled.set(false);

            if (!res.success){
                console.log(res.message);

                if (res.statusCode >= 500){
                    formNotification.set('Error: ' + res.message);
                    return;
                }

                errLog = res.message;
                errIcon = res.icon;
                return;
            }

            console.log('Key data fetched');

            chatRoomStore.update(room => {
                room.Key = key;
                room.userList = res.users;
                room.maxUsers = res.maxUsers;
                return room;
            });

            showUserInputForm.set(true);
            formActionButtonDisabled.set(false);
            
        }).on('error', (err: string) => {
            console.log(err);
            errLog = err;
            errIcon = 'fa-solid fa-circle-exclamation';
        });
    }

    function createChat(){
        key = '';
        showUserInputForm.set(true);
    }
</script>

<svelte:head>
    <title>Poketab - Join</title>
</svelte:head>

<div class="inputForm" in:fly={{x: 30}}>
    <div class="formtitle">
        <div class="text">Join chat</div>
        <img src="/images/pokeball.png" alt="Pokeball Logo">
    </div>
    <div class="formField">
        <label for="key">{LabelText} <i class="{LabelIcon}"></i></label>
        <div class="err {errAnimation}">{errLog} <i class="{errIcon}"></i></div>
        <input on:paste={parseKey} on:keydown={validateKey} id="key" type="text" bind:value={key} name="key" placeholder="xx-xxx-xx">
    </div>
    <div class="formFieldContainer">
        <div class="formField">
            {#if $reconnectButtonEnabled}
            <button class="button-animate hover btn play-sound recon" on:click={reConnectSocket}>Reconnect</button>
            {:else}
            <button class="button-animate hover btn play-sound" disabled={$formActionButtonDisabled || !$socketConnected} on:click={checkKey}>
                {joinActionText}
                {#if $formActionButtonDisabled && joinActionText == 'Checking...'}
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                {/if}
            </button>
            {/if}

        </div>
        <div class="formField create">
            <button class="button-animate hover btn play-sound" on:click={createChat}>Create chat</button>
        </div>
    </div>
</div>

<style lang="scss">

    .recon{
        background: var(--red);
    }

     .formFieldContainer{
        display: flex;
        flex-direction: row;
        gap: 10px;
        width: 100%;
    }

    .create button{
        background: black;
    }

    label{
        color: var(--foreground-dark);
    }

    .formtitle {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .inputForm{
        //drop shadow
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
    }
</style>