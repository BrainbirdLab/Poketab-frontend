<script lang="ts">
    import { fly } from "svelte/transition";

    import { socket, reConnectSocket } from "$lib/connection/socketClient";
    import {
        formNotification,
        reconnectButtonEnabled,
        formActionButtonDisabled,
        chatRoomStore,
        showUserInputForm,
        joinError,
        joinKey,
    } from "$lib/store.svelte";

    import type { chatRoomStoreType, User } from "$lib/types";

    import { onDestroy, onMount } from "svelte";
    import AppLogo from "./appLogo.svelte";

    function testKey(k: string) {
        return /^[a-zA-Z0-9]{2}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{2}$/.test(k);
    }

    function validateKey(e: KeyboardEvent) {

        if (!e.ctrlKey && e.key != "v") {
            e.preventDefault();
        }
        if (e.key == "Enter") {
            checkKey();
        } else if (/^[a-zA-Z0-9]$/.test(e.key) && joinKey.value.length < 9) {
            // Only allow letters and numbers
            if (joinKey.value.length == 2 || joinKey.value.length == 6) {
                joinKey.value += "-";
            }
            joinKey.value += e.key;
        } else if (e.key == "Backspace") {
            if (joinKey.value.length > 0) {
                // Remove '-' if the previous character is '-'
                if (joinKey.value.at(-2) == "-") {
                    joinKey.value = joinKey.value.slice(0, -2);
                } else {
                    joinKey.value = joinKey.value.slice(0, -1);
                }
            }
        }
    }

    function parseKey(e: ClipboardEvent) {
        e.preventDefault();
        //convert abcedfg to ab-cde-fg
        let value = e.clipboardData?.getData("text/plain");
        if (!value) return;

        if (value.length == 7) {
            value =
                value.slice(0, 2) +
                "-" +
                value.slice(2, 5) +
                "-" +
                value.slice(5, 7);
        }
        if (testKey(value)) {
            joinKey.value = value;
            checkKey();
        }
    }

    let LabelText = "Enter key";
    let LabelIcon = "fa-solid fa-key";

    let joinActionText = $state("Join Chat");

    let joinInput = $state() as HTMLInputElement;

    type fetchResponse = {
        success: boolean;
        message: string;
        statusCode: number;
        icon: string;
        users: { [key: string]: User };
        maxUsers: number;
    };

    function checkKey() {

        joinError.value.text = "";

        if (!joinKey.value) {
            joinError.value.text = "Key is required";
            joinError.value.icon = "fa-solid fa-triangle-exclamation";
            joinInput.focus();
            return;
        } else {
            joinError.value.text = "";
        }

        if (!testKey(joinKey.value)) {
            joinError.value.text = "Invalid key";
            joinError.value.icon = "fa-solid fa-triangle-exclamation";
            joinInput.focus();
            return;
        } else {
            joinError.value.text = "";
        }

        joinActionText = "Checking...";
        formActionButtonDisabled.value = true;

        joinError.value.icon = "";


        //params: key: string, ssr: boolean, callback: (res: fetchResponse) => void
        socket
            .emit("fetchKeyData", joinKey.value, false, (res: fetchResponse) => {
                joinActionText = "Join Chat";
                //joinActionDisabled = false;
                formActionButtonDisabled.value = false;

                if (!res.success) {

                    if (res.statusCode >= 500) {
                        formNotification.value = "Error: " + res.message;
                        return;
                    }

                    joinError.value.text = res.message;
                    joinError.value.icon = res.icon;
                    return;
                }

                const newVal: chatRoomStoreType = {
                    Key: joinKey.value,
                    userList: res.users,
                    maxUsers: res.maxUsers,
                    admin: "",
                };

                chatRoomStore.value = newVal;

                showUserInputForm.value = true;
                formActionButtonDisabled.value = false;
            })
            .on("error", (err: string) => {
                console.log(err);
                joinError.value.text = err;
                joinError.value.icon = "fa-solid fa-circle-exclamation";
            });
    }

    function createChat() {
        joinKey.value = "";
        showUserInputForm.value = true;
    }

    onMount(() => {
        if (socket.connected && formActionButtonDisabled.value){
            formActionButtonDisabled.value = false;
        }
    });

    onDestroy(() => {
        joinError.value = { text: "", icon: "" };
        joinKey.value = "";
    });
</script>

<svelte:head>
    <title>Poketab - Join</title>
</svelte:head>

<div class="formWrapper">
    <div class="form back-blur" in:fly={{ x: 30 }}>
        <div class="formtitle">
            <AppLogo title={{text: 'Join chat', icon: "fa-solid fa-user-group"}}/>
        </div>
        <div class="formfield margin"
        in:fly={{y: 5, delay: 150}}
        >
            <input
            onpaste={parseKey}
            onkeydown={validateKey}
            oninput={() => { joinError.value = { text: "", icon: "" }}}
            bind:value={joinKey.value}
            bind:this={joinInput}
            id="key"
            type="text"
            name="key"
            placeholder="xx-xxx-xx"
            autocomplete="off"
            disabled={formActionButtonDisabled.value ||
                            !socket.connected}
            />
            <label for="key" class:error={joinError.value.text}>
                {#if joinError.value.text}
                    {joinError.value.text} <i class={joinError.value.icon}></i>
                {:else}
                    {LabelText} <i class={LabelIcon}></i>
                {/if}
            </label>
        </div>
        <div class="formfield">
            {#if reconnectButtonEnabled.value}
                <button
                    class="button-animate hover  play-sound recon"
                    onclick={() => {reConnectSocket()}}>Reconnect</button
                >
            {:else}
                <button
                    class="button-animate hover  play-sound"
                    disabled={formActionButtonDisabled.value || !socket.connected}
                    onclick={checkKey}
                >
                    {joinActionText}
                    {#if formActionButtonDisabled.value && joinActionText == "Checking..."}
                        <i class="fa-solid fa-circle-notch fa-spin"></i>
                    {/if}
                </button>
            {/if}
        </div>
        <div class="redirect">
            <span class="redir-label">Or may be you want to</span>
            <button
                id="redirect"
                class="noSelect button-animate hover play-sound"
                onclick={createChat}>Create a chat?</button
            >
        </div>
    </div>
</div>

<style lang="scss">

    .margin{
        margin: 20px 0;
    }

    .formFieldContainer {
        display: flex;
        flex-direction: row;
        gap: 10px;
        width: 100%;
    }

    .formtitle {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
    }

    .inputForm {
        //drop shadow
        box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    }
</style>
