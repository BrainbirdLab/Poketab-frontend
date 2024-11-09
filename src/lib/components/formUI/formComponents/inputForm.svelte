<script lang="ts">
    import { run } from 'svelte/legacy';

    import "./forms.scss";
    import { avList } from "$lib/utils/validation";
    import { fly, scale } from "svelte/transition";
    import { onDestroy, onMount } from "svelte";

    import {
        socket,
        reConnectSocket,
    } from "$lib/connection/socketClient";
    import {
        formActionButtonDisabled,
        reconnectButtonEnabled,
        showUserInputForm,
        chatRoomStore,
        myId,
        joinedChat,
        isTaken,
        currentPage,
        formNotification,
        splashMessage,
        myPrivateKey,
    } from "$lib/store.svelte";
    import AppLogo from "./appLogo.svelte";
    import type { chatRoomStoreType, User } from "$lib/types";
    import { bufferToString, exportPublicKey, importPublicKey, makeKeyPair, stringToBuffer } from "$lib/e2e/encryption";
    import Quantum from "$lib/components/icons/quantum.svelte";
    import DotStream from "$lib/components/icons/dotStream.svelte";
    import type { socketResponse } from '$lib/connection/socketResponseType';

    let selectedavatar = $state("");
    let selectedMaxUser = $state(2);

    let avatarErr = $state("");
    let maxUserErr = $state("");

    let errAnimation = $state("");

    $effect(() => {
        if (avatarErr || maxUserErr) {
            errAnimation = "shake";
            setTimeout(() => {
                errAnimation = "";
            }, 100);
        } else {
            errAnimation = "";
        }
    });

    let titleText = chatRoomStore.value.Key ? "Join chat" : "Create chat";

    const actionCreateKey = "Creating encryption keys";
    const actionConnectKey = "Establishing connection";
    const actionEncryptChat = "Encrypting chat";

    let actionButtonText = $state(titleText);

    let mounted = $state(false);

    socket.on("disconnect", () => {
        actionButtonText = titleText;
    });

    if (chatRoomStore.value.Key) {
        socket.emit(
            "fetchKeyData",
            chatRoomStore.value.Key,
            false,
            (res: socketResponse) => {
                if (!res.success) {
                    showUserInputForm.value = false;
                } else {
                    chatRoomStore.value.userList = res.users;
                    showUserInputForm.value = true;
                }
            },
        );
    }

    onMount(() => {
        mounted = true;
    });

    onDestroy(() => {
        avatarErr = "";
        maxUserErr = "";
    });

    async function requestForChat(evt: Event) {
        evt.preventDefault();

        avatarErr = "";
        maxUserErr = "";

        if (!selectedavatar) {
            avatarErr = "Please choose a avatar";
            return;
        }

        if (
            (!chatRoomStore.value.Key && selectedMaxUser < 2) ||
            selectedMaxUser > 10
        ) {
            maxUserErr = "Max users must be between 2 and 10";
            return;
        }

        if (isTaken(selectedavatar)) {
            avatarErr = "avatar is already in use";
            return;
        }

        //initChatActionDisabled = true;
        formActionButtonDisabled.value = true;
        actionButtonText = actionCreateKey;

        //make my private-public key pair
        const pair = await makeKeyPair();
        const publicKey = await exportPublicKey(pair.publicKey);

        actionButtonText = actionConnectKey;
        
        if (!chatRoomStore.value.Key) {
            socket.emit(
                "createChat",
                selectedavatar,
                selectedMaxUser,
                bufferToString(publicKey),
                (res: {
                    success: boolean;
                    message: string;
                    key: string;
                    userId: string;
                    maxUsers: number;
                    user: User;
                }) => {
                    if (!res.success) {
                        console.log("Error: " + res.message);
                        formNotification.value = "Error: " + res.message;
                        formActionButtonDisabled.value = false;
                        return;
                    }

                    actionButtonText = actionEncryptChat;

                    res.user.publicKey = pair.publicKey;
                    myPrivateKey.value = pair.privateKey;

                    const newVal: chatRoomStoreType = {
                        Key: res.key,
                        admin: res.userId,
                        maxUsers: selectedMaxUser,
                        userList: {[res.userId]: res.user},
                    }

                    chatRoomStore.value = newVal;

                    myId.value = res.userId;

                    joinedChat.value = true;
                    currentPage.value = "chat";
                    splashMessage.value = "";
                    selectedavatar = "";
                    selectedMaxUser = 2;
                    formActionButtonDisabled.value = false;
                },
            );
        } else {
            socket.connect();
            socket.emit(
                "joinChat",
                chatRoomStore.value.Key,
                selectedavatar,
                bufferToString(publicKey),
                async (res: {
                    success: boolean;
                    message: string;
                    userId: string;
                    admin: string;
                    maxUsers: number;
                    users: {[key: string]: {
                        avatar: string;
                        uid: string;
                        publicKey: string;
                    }};
                }) => {
                    if (!res.success) {
                        console.log("Error: " + res.message);
                        formNotification.value = "Error: " + res.message;
                        formActionButtonDisabled.value = false;
                        showUserInputForm.value = false;
                        return;
                    }

                    actionButtonText = actionEncryptChat;

                    const newVal: chatRoomStoreType = {
                        Key: chatRoomStore.value.Key,
                        admin: res.admin,
                        maxUsers: res.maxUsers,
                        userList: {},
                    }

                    chatRoomStore.value = newVal;

                    myPrivateKey.value = pair.privateKey;

                    Object.entries(res.users).forEach(async ([uid, user]) => {

                        const pubKey = await importPublicKey(stringToBuffer(user.publicKey));
                        const u: User = {
                            avatar: user.avatar,
                            uid: user.uid,
                            publicKey: pubKey,
                        };
                        chatRoomStore.value.userList[uid] = u;
                    });


                    myId.value = res.userId;

                    joinedChat.value = true;
                    currentPage.value = "chat";
                    splashMessage.value = "";
                    selectedavatar = "";
                    selectedMaxUser = 2;
                    formActionButtonDisabled.value = false;
                },
            );
        }
    }

    function redirect() {
        showUserInputForm.value = false;
    }
</script>

<svelte:head>
    <title>Poketab - {titleText}</title>
</svelte:head>

{#if mounted}
    <div class="formWrapper">
        <div class="form box-shadow back-blur" in:fly={{ y: 30 }}>
            <div class="formtitle">
                <AppLogo title={ !chatRoomStore.value.Key ? {text: 'Create chat', icon: "fa-solid fa-meteor"} : {text: 'Join chat', icon: "fa-solid fa-handshake"}}/>
            </div>
            <div class="formfield">
                <label for="avatar" class:error={avatarErr} class:selected={selectedavatar}>
                    {#if avatarErr}
                    {avatarErr}
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    {:else}
                        Pick your avatar <i class="fa-solid fa-user-astronaut"></i>
                    {/if}
                </label>
                <div id="avatar" class="avatarsContainer">
                    <div class="avatars">
                        {#each avList as avatar, i}
                            {#if chatRoomStore.value.Key && isTaken(avatar)}
                                <div
                                    class="avatar inuse"
                                    in:fly|global={{ x: 10, delay: i * 30 }}
                                >
                                    <label
                                        class="avatarLabel btn-animate"
                                        for=""
                                    >
                                        <img
                                            src="/images/avatars/{avatar}(custom).webp"
                                            alt={avatar}
                                        />
                                    </label>
                                </div>
                            {:else}
                                <div
                                    class="avatar"
                                    in:scale|global={{ delay: i * 30 }}
                                >
                                    <input
                                        type="radio"
                                        class="avatarInput"
                                        oninput={() => (avatarErr = "")}
                                        bind:group={selectedavatar}
                                        name="avatar"
                                        value={avatar}
                                        id={avatar}
                                        disabled={formActionButtonDisabled.value ||
                                        !socket.connected}
                                    />
                                    <label
                                        class="avatarLabel btn-animate"
                                        for={avatar}
                                    >
                                        <img
                                            loading="lazy"
                                            src="/images/avatars/{avatar}(custom).webp"
                                            alt={avatar}
                                        />
                                    </label>
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            </div>

            {#if !chatRoomStore.value.Key}
                <div class="formfield range">
                    <label for="maxUsers"
                        >Create chat for ({selectedMaxUser}) users</label
                    >
                    {#if maxUserErr}
                        <div class="err {errAnimation}">
                            {maxUserErr}
                            <i class="fa-solid fa-triangle-exclamation"></i>
                        </div>
                    {/if}
                    <input
                        disabled={formActionButtonDisabled.value ||
                            !socket.connected}
                        type="range"
                        bind:value={selectedMaxUser}
                        name="maxUsers"
                        id="maxUsers"
                        min="2"
                        max="10"
                    />
                </div>
            {/if}

            <div class="formfield">
                {#if reconnectButtonEnabled.value}
                    <button
                        class="button-animate hover play-sound recon"
                        onclick={() => {reConnectSocket()}}>Reconnect</button
                    >
                {:else}
                    <button
                        class="button-animate hover play-sound"
                        disabled={formActionButtonDisabled.value ||
                            !socket.connected}
                        onclick={requestForChat}
                    >
                        {actionButtonText} 
                        {#if formActionButtonDisabled.value}
                            {#if actionButtonText == actionConnectKey}
                            <DotStream/>
                            {:else if actionButtonText != titleText}
                            <Quantum />
                            {/if}
                        {/if}
                    </button>
                {/if}
            </div>

            <div class="redirect">
                <span class="redir-label">Or may be you want to</span>
                <button
                    id="redirect"
                    class="noSelect button-animate hover play-sound"
                    onclick={redirect}>Join a chat?</button
                >
            </div>
        </div>
    </div>
{/if}

<style lang="scss">

    input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        padding: 10px 0;
        width: 100%;
    }

    input[type="range"]:focus {
        outline: none;
    }

    input[type="range"]::-webkit-slider-runnable-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        box-shadow: 0px 0px 0px #000000;
        background:  hsla(0, 0%, 100%, 0.07);
        border-radius: 3px;
        border: 0px solid #000000;
        z-index: 0;
    }

    input[type="range"]::-moz-range-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        box-shadow: 0px 0px 0px #000000;
        background:  hsla(0, 0%, 100%, 0.07);
        border-radius: 3px;
        border: 0px solid #000000;
        z-index: 0;
    }

    input[type="range"]::-ms-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
        z-index: 0;
    }

    input[type="range"]::-ms-fill-lower {
        background:  hsla(0, 0%, 100%, 0.07);
        border: 0px solid #000000;
        border-radius: 2px;
        box-shadow: 0px 0px 0px #000000;
    }

    input[type="range"]::-ms-fill-upper {
        background:  hsla(0, 0%, 100%, 0.07);
        border: 0px solid #000000;
        border-radius: 2px;
        box-shadow: 0px 0px 0px #000000;
    }

    input[type="range"]::-webkit-slider-thumb {
        box-shadow: 0px 0px 0px #000000;
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--secondary-dark, #4598ff);
        cursor: pointer;
        -webkit-appearance: none;
        appearance: none;
        margin-top: -6.5px;
        z-index: 2;
    }

    input[type="range"]::-moz-range-thumb {
        box-shadow: 0px 0px 0px #000000;
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--secondary-dark, #4598ff);
        cursor: pointer;
        z-index: 2;
    }

    input[type="range"]::-ms-thumb {
        margin-top: 1px;
        box-shadow: 0px 0px 0px #000000;
        border: 0px solid #2497e3;
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--secondary-dark, #4598ff);
        cursor: pointer;
        z-index: 2;
    }

    .avatarsContainer {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 5px;
        .avatars {
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
            .avatar {
                background: #ffffff0d;
                border-radius: 50%;
                .avatarLabel {
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

                &.inuse {
                    filter: brightness(0);
                    .avatarLabel {
                        cursor: not-allowed;
                    }
                }

                &:not(.inuse):hover {
                    .avatarLabel {
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

    label.selected{
        color: var(--secondary-dark);
    }

    .range {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
    }
</style>
