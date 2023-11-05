<script lang="ts">
    import { fly } from "svelte/transition";

    import {authSocket, reConnectAuthSocket} from "./authSocket";
    import {reconnectButtonEnabled, authSocketConnected} from "$lib/store";

    import {formActionButtonDisabled, chatRoomStore, showUserInputForm, usedAvatars, usedUsernames} from "$lib/store";

    let key = '';

    let errLog = '';
    let errAnimation = '';
    let errIcon = '';
    let LabelText = 'Enter key';
    let LabelIcon = 'fa-solid fa-key';

    let joinActionText = 'Join Chat';

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
        formActionButtonDisabled.set(true);

        errIcon = '';

        console.log('Fetching key data');

        authSocket.emit('fetchKeyData', key, (res: fetchResponse) => {

            joinActionText = 'Join Chat';
            //joinActionDisabled = false;
            formActionButtonDisabled.set(false);

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

            console.log('Key data fetched');

            usedUsernames.set(res.usernames);
            usedAvatars.set(res.avatars);
            chatRoomStore.update(room => {
                room.Key = key;
                return room;
            });

            showUserInputForm.set(true);
            formActionButtonDisabled.set(false);
            
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
            {#if $reconnectButtonEnabled}
            <button class="button-animate hover btn play-sound recon" on:click={reConnectAuthSocket}>Reconnect</button>
            {:else}
            <button class="button-animate hover btn play-sound" disabled={$formActionButtonDisabled || !$authSocketConnected} on:click={checkKey}>
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