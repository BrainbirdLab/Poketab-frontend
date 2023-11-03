<script lang="ts">
    import { avList } from "$lib/utils/validation";
    import { selfInfoStore, usedUsernames, usedAvatars, chatRoomStore, showUserInputForm, isConnected } from "$lib/store";
    import { fly } from "svelte/transition";
    import { onDestroy } from "svelte";
    
    import {authSocket} from "./authSocket";

    let selectedUsername = '';
    let selectedAvatar = '';
    let selectedMaxUser = 2;
    
    let usernameErr = '';
    let avatarErr = '';
    let maxUserErr = '';

    let errAnimation = '';

    let initText = $chatRoomStore.key ? 'Join' : 'Create';

    let initChatActionDisabled = false;

    if (!authSocket.connected){
        console.log('Connecting auth socket');
        authSocket.connect();
    }

    onDestroy(() => {
        usernameErr = '';
        avatarErr = '';
        maxUserErr = '';
        authSocket.disconnect();
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

        if (!$chatRoomStore.key && selectedMaxUser < 2 || selectedMaxUser > 10){
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

        selfInfoStore.update(store => {
           store.name = selectedUsername;
           store.avatar = selectedAvatar;
           return store;
        });

        chatRoomStore.update(store => {
            store.maxUser = selectedMaxUser;
            return store;
        });

        console.log('Connecting to chat...');

        initChatActionDisabled = true;
        initText = 'Please wait ';

        if (!$chatRoomStore.key){
            console.log('Create new key');
            //console.log(`Username: ${get(selfInfoStore).name}, Avatar: ${get(selfInfoStore).avatar}, Max user: ${get(chatRoomStore).maxUser}`);
            authSocket.emit('createChat', $selfInfoStore.name, $selfInfoStore.avatar, $chatRoomStore.maxUser, (res: {success: boolean, message: string, key: string, userId: string, maxUser: number}) => {
                if (!res.success){
                    console.log('Error: ' + res.message);
                    return;
                }
                //chatRoom.key = res.key;
                chatRoomStore.update(room => {
                    room.key = res.key;
                    room.maxUser = res.maxUser;
                    return room;
                });
                //selfInfo.id = res.userId;
                selfInfoStore.update(info => {
                    info.id = res.userId;
                    return info;
                });

                selectedUsername = '';
                selectedAvatar = '';
                selectedMaxUser = 2;

                isConnected.set(true);
            });
        } else{
        console.log('Joining key: ' + $chatRoomStore.key);
        authSocket.emit('joinChat', $chatRoomStore.key, $selfInfoStore.name, $selfInfoStore.avatar, (res: {success: boolean, message: string, userId: string, maxUser: number}) => {
            if (!res.success){
                console.log('Error: ' + res.message);
                return;
            }
            selfInfoStore.update(info => {
                info.id = res.userId;
                return info;
            });
            //chatRoom.key = key;
            chatRoomStore.update(room => {
                room.maxUser = res.maxUser;
                return room;
            });

            selectedUsername = '';
            selectedAvatar = '';
            selectedMaxUser = 2;

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
                    {#if $chatRoomStore.key && $usedAvatars.includes(avatar)}
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

    {#if !$chatRoomStore.key}
    <div class="formField range">
        <label for="maxUser">Create chat for ({selectedMaxUser}) users</label>
        {#if maxUserErr}
        <div class="err {errAnimation}">{maxUserErr} <i class="fa-solid fa-triangle-exclamation"></i></div>
        {/if}
        <input type="range" bind:value={selectedMaxUser} name="maxUser" id="maxUser" min="2" max="10">
    </div>
    {/if}

    <div class="formField">
        <button class="button-animate hover btn play-sound" disabled={initChatActionDisabled} on:click={requestForChat}>
            {initText} 
            {#if initChatActionDisabled}
                <i class="fa-solid fa-spin fa-circle-notch"></i>
            {/if}
        </button>
    </div>

    <div class="redirect">
        <fieldset>
            <legend>Or</legend>
            <button id="redirect" class="noSelect button-animate hover btn play-sound" on:click={redirect}>Join chat</button>
        </fieldset>
    </div>

</div>

<style lang="scss">

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
</style>