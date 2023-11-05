<script lang="ts">
    import { avList } from "$lib/utils/validation";
    import { fly } from "svelte/transition";
    import { onDestroy } from "svelte";
    
    import {authSocket, reConnectAuthSocket} from "./authSocket";
    import {formActionButtonDisabled, reconnectButtonEnabled, usedUsernames, usedAvatars, showUserInputForm, chatRoomStore, isConnected, selfInfoStore, authSocketConnected} from "$lib/store";

    let selectedUsername = '';
    let selectedAvatar = '';
    let selectedMaxUser = 2;
    
    let usernameErr = '';
    let avatarErr = '';
    let maxUserErr = '';

    let errAnimation = '';

    let initText = $chatRoomStore.Key ? 'Join' : 'Create';


    onDestroy(() => {
        usernameErr = '';
        avatarErr = '';
        maxUserErr = '';
    });

    function requestForChat(evt: Event){

        evt.preventDefault();

        console.log('Requesting for chat');

        usernameErr = '';
        avatarErr = '';
        maxUserErr = '';

        if (!selectedUsername){
            usernameErr = 'Please enter a username';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        }

        if (selectedUsername.length < 3 || selectedUsername.length > 15){
            usernameErr = 'Username must be between 3 and 15 characters';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        } else if (!/^[a-zA-Z0-9_]+$/.test(selectedUsername)){
            usernameErr = 'Invalid characters in username';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        }

        if (!selectedAvatar){
            avatarErr = 'Please select an avatar';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        }

        if (!$chatRoomStore.Key && selectedMaxUser < 2 || selectedMaxUser > 10){
            maxUserErr = 'Max users must be between 2 and 10';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        }

        if ($usedUsernames?.includes(selectedUsername)){
            usernameErr = 'Username is already in use';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        }

        if ($usedAvatars?.includes(selectedAvatar)){
            avatarErr = 'Avatar is already in use';
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
            return;
        }

        console.log('Connecting to chat...');

        //initChatActionDisabled = true;
        formActionButtonDisabled.set(true);
        initText = 'Please wait ';

        if (!$chatRoomStore.Key){
            console.log('Create new key');
            //console.log(`Username: ${get(selfInfoStore).name}, Avatar: ${get(selfInfoStore).avatar}, Max user: ${get(chatRoomStore).maxUsers}`);
            authSocket.emit('createChat', selectedUsername, selectedAvatar, selectedMaxUser, (res: {success: boolean, message: string, key: string, userId: string, maxUsers: number}) => {
                if (!res.success){
                    console.log('Error: ' + res.message);
                    return;
                }

                selectedUsername = '';
                selectedAvatar = '';
                selectedMaxUser = 2;

                chatRoomStore.update(room => {
                    room.Key = res.key;
                    room.maxUsers = res.maxUsers;
                    return room;
                });

                selfInfoStore.update(info => {
                    info.id = res.userId;
                    info.name = selectedUsername;
                    info.avatar = selectedAvatar;
                    return info;
                });

                isConnected.set(true);
            });
        } else{
            console.log('Joining key: ' + $chatRoomStore.Key);
            authSocket.connect();
            authSocket.emit('joinChat', $chatRoomStore.Key, selectedUsername, selectedAvatar, (res: {success: boolean, message: string, userId: string, maxUsers: number}) => {
                if (!res.success){
                    console.log('Error: ' + res.message);
                    return;
                }

                selectedUsername = '';
                selectedAvatar = '';
                selectedMaxUser = 2;

                chatRoomStore.update(room => {
                    room.maxUsers = res.maxUsers;
                    return room;
                });

                selfInfoStore.update(info => {
                    info.id = res.userId;
                    info.name = selectedUsername;
                    info.avatar = selectedAvatar;
                    return info;
                });

                isConnected.set(true);
            });
        }
    }

    function redirect(){
        showUserInputForm.set(false);
    }

</script>

<div class="inputForm" in:fly={{y: 30}}>
    <div class="formField">
        <label for="username">Choose your name <i class="fa-solid fa-signature"></i></label>
        {#if usernameErr}            
        <div class="err {errAnimation}">{usernameErr} <i class="fa-solid fa-triangle-exclamation"></i></div>
        {/if}
        <input type="text" bind:value={selectedUsername} name="username" class="hover" id="username" placeholder="Username">
    </div>
    <div class="formField">
        <label for="avatar">Pick an avatar <i class="fa-solid fa-user-astronaut"></i></label>
        {#if avatarErr}
        <div class="err {errAnimation}">{avatarErr} <i class="fa-solid fa-triangle-exclamation"></i></div>
        {/if}
        <div id="avatar" class="avatarsContainer">
            <div class="avatars">
                {#each avList as avatar}
                <div class="avatar">
                    {#if $chatRoomStore.Key && $usedAvatars.includes(avatar)}
                    <label class="avatarLabel btn btn-animate inuse" for="">
                        <img src="/images/avatars/{avatar}(custom).webp" alt="{avatar}">
                    </label>
                    {:else}
                    <input type="radio" class="avatarInput" bind:group={selectedAvatar} name="avatar" value="{avatar}" id="{avatar}">
                    <label class="avatarLabel btn btn-animate" for="{avatar}">
                        <img src="/images/avatars/{avatar}(custom).webp" alt="{avatar}">
                    </label>
                    {/if}
                </div>
                {/each}
            </div>
        </div>
    </div>

    {#if !$chatRoomStore.Key}
    <div class="formField range">
        <label for="maxUsers">Create chat for ({selectedMaxUser}) users</label>
        {#if maxUserErr}
        <div class="err {errAnimation}">{maxUserErr} <i class="fa-solid fa-triangle-exclamation"></i></div>
        {/if}
        <input type="range" bind:value={selectedMaxUser} name="maxUsers" id="maxUsers" min="2" max="10">
    </div>
    {/if}

    <div class="formField">

        {#if $reconnectButtonEnabled}
        <button class="button-animate hover btn play-sound recon" on:click={reConnectAuthSocket}>Reconnect</button>
        {:else}
        <button class="button-animate hover btn play-sound" disabled={$formActionButtonDisabled || !$authSocketConnected} on:click={requestForChat}>
            {initText} 
            {#if $formActionButtonDisabled && initText.includes('Please wait')}
                <i class="fa-solid fa-spin fa-circle-notch"></i>
            {/if}
        </button>
        {/if}
    </div>

    <div class="redirect">
        <fieldset>
            <legend>Or</legend>
            <button id="redirect" class="noSelect button-animate hover btn play-sound" on:click={redirect}>Join chat</button>
        </fieldset>
    </div>

</div>

<style lang="scss">

    .recon{
        background: var(--red);
    }

    .avatarsContainer{
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 5px;

        .avatars{
            display: flex;
            flex-wrap: wrap;
            height: 138px !important;
            width: 250px !important;
            gap: 10px;
            align-items: center;
            justify-content: center;
            align-content: flex-start;
            overflow: scroll;
            border-radius: 10px;

            .avatar{
                background: #ffffff0d;
                border-radius: 50%;
                .avatarLabel{
                    display: block;
                    width: 40px;
                    height: 40px;
                    cursor: pointer;
                    filter: saturate(0.1);
                    img {
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                    }

                    &.inuse{
                        cursor: not-allowed;
                        filter: brightness(0);
                    }
                }

                &:hover{
                    .avatarLabel{
                        filter: saturate(100%);
                    }
                }
            }

            .avatarInput:checked + .avatarLabel {
                filter: saturate(100%);
                animation: bubble 500ms forwards;
            }
        }
    }

    input[type=radio] {
        display: none;
    }

    .redirect{
        width: 100%;
    }

    #redirect{
        color: var(--secondary-dark, #4598ff);
        text-decoration: underline;
        cursor: pointer;
        background: none;
        border: none;
        outline: none;
        font-size: 1rem;
        font-family: 'Com';
    }

    fieldset {
        border-left: 0;
        border-right: 0;
        border-bottom: 0;
        border-top: 2px solid rgba(255, 255, 255, 0.0901960784);
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
        width: 100%;

        legend {
            padding: 5px;
            color: #bababa;
            font-size: 0.7rem;
        }
    }

    .inputForm{
        //drop shadow
        box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.75);
    }
</style>