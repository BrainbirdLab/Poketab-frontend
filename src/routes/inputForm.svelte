<script lang="ts">
    import { avList } from "$lib/utils/validation";
    import { fly, fade, slide, scale } from "svelte/transition";
    import { onDestroy, onMount } from "svelte";
    
    import {socket, reConnectSocket} from "../lib/components/socket";
    import {type User, formActionButtonDisabled, reconnectButtonEnabled, showUserInputForm, chatRoomStore, selfInfoStore, socketConnected, joinedChat, isTaken, currentPage, formNotification, splashMessage} from "$lib/store";

    let selectedname = '';
    let selectedAvatar = '';
    let selectedMaxUser = 2;
    
    let nameErr = '';
    let avatarErr = '';
    let maxUserErr = '';

    let errAnimation = '';

    $: {
        if (nameErr || avatarErr || maxUserErr){
            errAnimation = 'shake';
            setTimeout(() => {
                errAnimation = '';
            }, 100);
        } else {
            errAnimation = '';
        }
    }

    let actionButtonText = $chatRoomStore.Key ? 'Join' : 'Create';

    let mounted = false;

    onMount(() => {
        mounted = true;
    });

    onDestroy(() => {
        nameErr = '';
        avatarErr = '';
        maxUserErr = '';
    });

    function requestForChat(evt: Event){

        evt.preventDefault();

        console.log('Requesting for chat');

        nameErr = '';
        avatarErr = '';
        maxUserErr = '';

        if (!selectedname){
            nameErr = 'Please enter a name';
            return;
        }

        if (selectedname.length < 3 || selectedname.length > 15){
            nameErr = 'name must be between 3 and 15 characters';
            return;
        } else if (!/^[a-zA-Z0-9_]+$/.test(selectedname)){
            nameErr = 'Invalid characters in name';
            return;
        }

        if (!selectedAvatar){
            avatarErr = 'Please select an avatar';
            return;
        }

        if (!$chatRoomStore.Key && selectedMaxUser < 2 || selectedMaxUser > 10){
            maxUserErr = 'Max users must be between 2 and 10';
            return;
        }

        if (isTaken('name', selectedname)){
            nameErr = 'Name is already in use';
            return;
        }

        if (isTaken('avatar' ,selectedAvatar)){
            avatarErr = 'Avatar is already in use';
            return;
        }

        console.log('%cValidation Passed', 'color: green')

        console.log('Connecting to chat...');

        //initChatActionDisabled = true;
        formActionButtonDisabled.set(true);
        actionButtonText = 'Please wait ';

        if (!$chatRoomStore.Key){
            console.log('Creating chat...');
            //console.log(`name: ${get(selfInfoStore).name}, Avatar: ${get(selfInfoStore).avatar}, Max user: ${get(chatRoomStore).maxUsers}`);
            socket.emit('createChat', selectedname, selectedAvatar, selectedMaxUser, (res: {success: boolean, message: string, key: string, userId: string}) => {
                if (!res.success){
                    console.log('Error: ' + res.message);
                    formNotification.set('Error: ' + res.message);
                    formActionButtonDisabled.set(false);
                    //showUserInputForm.set(false);
                    return;
                }

                chatRoomStore.update(room => {
                    room.Key = res.key;
                    room.maxUsers = selectedMaxUser;
                    return room;
                });

                selfInfoStore.update(info => {
                    info.uid = res.userId;
                    info.name = selectedname;
                    info.avatar = selectedAvatar;
                    return info;
                });

                console.log('Created key: ' + $chatRoomStore.Key);
                
                //chatSocketConnected.set(true);
                joinedChat.set(true);
                currentPage.set('chat');
                splashMessage.set('');
                selectedname = '';
                selectedAvatar = '';
                selectedMaxUser = 2;
                formActionButtonDisabled.set(false);
            });
        } else{
            console.log('Joining key: ' + $chatRoomStore.Key);
            socket.connect();
            socket.emit('joinChat', $chatRoomStore.Key, selectedname, selectedAvatar, (res: {success: boolean, message: string, userId: string, maxUsers: number}) => {
                if (!res.success){
                    console.log('Error: ' + res.message);
                    formNotification.set('Error: ' + res.message);
                    formActionButtonDisabled.set(false);
                    showUserInputForm.set(false);
                    return;
                }

                chatRoomStore.update(room => {
                    room.maxUsers = res.maxUsers;
                    return room;
                });

                selfInfoStore.update(info => {
                    info.uid = res.userId;
                    info.name = selectedname;
                    info.avatar = selectedAvatar;
                    return info;
                });

                console.log('Joined key: ' + $chatRoomStore.Key);

                //chatSocketConnected.set(true);
                joinedChat.set(true);
                currentPage.set('chat');
                splashMessage.set('');
                selectedname = '';
                selectedAvatar = '';
                selectedMaxUser = 2;
                formActionButtonDisabled.set(false);
            });
        }
    }

    function redirect(){
        showUserInputForm.set(false);
    }

</script>

<svelte:head>
    <title>Poketab - {actionButtonText}</title>
</svelte:head>

{#if mounted}
<div class="inputForm" in:fly={{y: 30}}>
    <div class="formField">
        <label for="name">Choose your name <i class="fa-solid fa-signature"></i></label>
        {#if nameErr}            
        <div class="err {errAnimation}">{nameErr} <i class="fa-solid fa-triangle-exclamation"></i></div>
        {/if}
        <input type="text" bind:value={selectedname} name="name" class="hover" id="name" placeholder="Name">
    </div>
    <div class="formField">
        <label for="avatar">Pick an avatar <i class="fa-solid fa-user-astronaut"></i></label>
        {#if avatarErr}
        <div class="err {errAnimation}">{avatarErr} <i class="fa-solid fa-triangle-exclamation"></i></div>
        {/if}
        <div id="avatar" class="avatarsContainer">
            <div class="avatars">
                {#each avList as avatar, i}
                {#if $chatRoomStore.Key && isTaken('avatar', avatar)}
                    <div class="avatar inuse" in:fly|global={{x: 10, delay: i*30}}>
                        <label class="avatarLabel btn btn-animate" for="">
                            <img src="/images/avatars/{avatar}(custom).webp" alt="{avatar}">
                        </label>
                    </div>
                    {:else}
                    <div class="avatar" in:scale|global={{delay: i*30}}>
                        <input type="radio" class="avatarInput" bind:group={selectedAvatar} name="avatar" value="{avatar}" id="{avatar}">
                        <label class="avatarLabel btn btn-animate" for="{avatar}">
                            <img src="/images/avatars/{avatar}(custom).webp" alt="{avatar}">
                        </label>
                    </div>
                    {/if}
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
        <button class="button-animate hover btn play-sound recon" on:click={reConnectSocket}>Reconnect</button>
        {:else}
        <button class="button-animate hover btn play-sound" disabled={$formActionButtonDisabled || !$socketConnected} on:click={requestForChat}>
            {actionButtonText} 
            {#if $formActionButtonDisabled && actionButtonText.includes('Please wait')}
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
{/if}

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

                }
                
                &.inuse{
                    filter: brightness(0);
                    .avatarLabel{
                        cursor: not-allowed;
                    }
                }

                &:not(.inuse):hover{
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