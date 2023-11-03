<script lang="ts">
    import { fly } from "svelte/transition";
    import { usedUsernames, usedAvatars, showUserInputForm, chatRoomStore } from "$lib/store";

    import {authSocket} from "./authSocket";

    let key = '';

    let errLog = '';
    let errAnimation = '';
    let errIcon = '';
    let LabelText = 'Enter key';
    let LabelIcon = 'fa-solid fa-key';

    let joinActionText = 'Join Chat';

    let joinActionDisabled = false;

    if (!authSocket.connected){
        console.log('Connecting auth socket');
        authSocket.connect();
    } else {
        errLog = '';
        errIcon = '';
    }



    type fetchResponse = {
        success: boolean,
        message: string,
        usernames: string[],
        avatars: string[],
        icon: string,
    }

    function checkKey(){
        console.log('Checking key');
        if (!key){
            console.log('Key is empty');
            errLog = 'Key is required';
            errIcon = 'fa-solid fa-triangle-exclamation';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        }else{
            errLog = '';
        }

        if (!/^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{2}$/.test(key)){
            console.log('Invalid key', key);
            errLog = 'Invalid key';
            errIcon = 'fa-solid fa-triangle-exclamation';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        }else{
            errLog = '';
        }

        joinActionText = 'Checking...';
        joinActionDisabled = true;

        errIcon = '';

        console.log('Fetching key data');

        if (!authSocket.connected){
            console.log('Socket not connected');
            errLog = 'Reconnecting...';
            errIcon = 'fa-solid fa-circle-notch fa-spin';
            authSocket.connect();
        } else {
            errLog = '';
            errIcon = '';
        }

        authSocket.emit('fetchKeyData', key, (res: fetchResponse) => {

            joinActionText = 'Join Chat';
            joinActionDisabled = false;

            if (!res.success){
                console.log(res.message);
                errLog = res.message;
                errIcon = res.icon;
                errAnimation = 'shake';
                setTimeout(() => {
                    errAnimation = '';
                }, 100);
                return;
            }

            usedUsernames.set(res.usernames);
            usedAvatars.set(res.avatars);

            chatRoomStore.update((val) => {
                val.key = key;
                return val;
            });

            showUserInputForm.set(true);
            
        }).on('error', (err: string) => {
            console.log(err);
            errLog = err;
            errIcon = 'fa-solid fa-circle-exclamation';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
        });
    }

    function createChat(){
        key = '';
        showUserInputForm.set(true);
    }
</script>

<div class="inputForm" in:fly={{x: 30}}>
    <div class="formtitle">
        <div class="text">Join chat</div>
        <img src="/images/pokeball.png" alt="Pokeball Logo">
    </div>
    <div class="formField">
        <label for="key">{LabelText} <i class="{LabelIcon}"></i></label>
        <div class="err {errAnimation}">{errLog} <i class="{errIcon}"></i></div>
        <input id="key" type="text" bind:value={key} name="key" placeholder="xx-xxx-xx">
    </div>
    <div class="formFieldContainer">
        <div class="formField">
            <button class="button-animate hover btn play-sound" disabled={joinActionDisabled} on:click={checkKey}>
                {joinActionText}
                {#if joinActionDisabled}
                    <i class="fa-solid fa-circle-notch fa-spin"></i>
                {/if}
            </button>
        </div>
        <div class="formField create">
            <button class="button-animate hover btn play-sound" on:click={createChat}>Create chat</button>
        </div>
    </div>
</div>

<style lang="scss">
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
</style>