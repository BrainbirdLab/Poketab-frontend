<script lang="ts">
    import { fly } from "svelte/transition";

    import { socket, reConnectSocket } from "$lib/socket";
    import {
        formNotification,
        reconnectButtonEnabled,
        formActionButtonDisabled,
        chatRoomStore,
        showUserInputForm,
        joinError,
        joinKey,
    } from "$lib/store";

    import type { User } from "$lib/types";

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
        } else if (/^[a-zA-Z0-9]$/.test(e.key) && $joinKey.length < 9) {
            // Only allow letters and numbers
            if ($joinKey.length == 2 || $joinKey.length == 6) {
                $joinKey += "-";
            }
            $joinKey += e.key;
        } else if (e.key == "Backspace") {
            if ($joinKey.length > 0) {
                // Remove '-' if the previous character is '-'
                if ($joinKey.at(-2) == "-") {
                    $joinKey = $joinKey.slice(0, -2);
                } else {
                    $joinKey = $joinKey.slice(0, -1);
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
            $joinKey = value;
            checkKey();
        }
    }

    let LabelText = "Enter key";
    let LabelIcon = "fa-solid fa-key";

    let joinActionText = "Join Chat";

    let joinInput: HTMLInputElement;

    type fetchResponse = {
        success: boolean;
        message: string;
        statusCode: number;
        icon: string;
        users: { [key: string]: User };
        maxUsers: number;
    };

    function checkKey() {

        $joinError.text = "";

        if (!$joinKey) {
            $joinError.text = "Key is required";
            $joinError.icon = "fa-solid fa-triangle-exclamation";
            joinInput.focus();
            return;
        } else {
            $joinError.text = "";
        }

        if (!testKey($joinKey)) {
            $joinError.text = "Invalid key";
            $joinError.icon = "fa-solid fa-triangle-exclamation";
            joinInput.focus();
            return;
        } else {
            $joinError.text = "";
        }

        joinActionText = "Checking...";
        formActionButtonDisabled.set(true);

        $joinError.icon = "";


        //params: key: string, ssr: boolean, callback: (res: fetchResponse) => void
        socket
            .emit("fetchKeyData", $joinKey, false, (res: fetchResponse) => {
                joinActionText = "Join Chat";
                //joinActionDisabled = false;
                formActionButtonDisabled.set(false);

                if (!res.success) {

                    if (res.statusCode >= 500) {
                        formNotification.set("Error: " + res.message);
                        return;
                    }

                    $joinError.text = res.message;
                    $joinError.icon = res.icon;
                    return;
                }

                chatRoomStore.update((room) => {
                    room.Key = $joinKey;
                    room.userList = res.users;
                    room.maxUsers = res.maxUsers;
                    return room;
                });

                showUserInputForm.set(true);
                formActionButtonDisabled.set(false);
            })
            .on("error", (err: string) => {
                console.log(err);
                $joinError.text = err;
                $joinError.icon = "fa-solid fa-circle-exclamation";
            });
    }

    function createChat() {
        $joinKey = "";
        showUserInputForm.set(true);
    }

    onMount(() => {
        if (socket.connected && $formActionButtonDisabled){
            formActionButtonDisabled.set(false);
        }
    });

    onDestroy(() => {
        joinError.set({ text: "", icon: "" });
        joinKey.set("");
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
            on:paste={parseKey}
            on:keydown={validateKey}
            on:input={() => { joinError.set({ text: "", icon: "" }); }}
            bind:value={$joinKey}
            bind:this={joinInput}
            id="key"
            type="text"
            name="key"
            placeholder="xx-xxx-xx"
            autocomplete="off"
            disabled={$formActionButtonDisabled ||
                            !socket.connected}
            />
            <label for="key" class:error={$joinError.text}>
                {#if $joinError.text}
                    {$joinError.text} <i class={$joinError.icon}></i>
                {:else}
                    {LabelText} <i class={LabelIcon}></i>
                {/if}
            </label>
        </div>
        <div class="formfield">
            {#if $reconnectButtonEnabled}
                <button
                    class="button-animate hover  play-sound recon"
                    on:click={() => {reConnectSocket()}}>Reconnect</button
                >
            {:else}
                <button
                    class="button-animate hover  play-sound"
                    disabled={$formActionButtonDisabled || !socket.connected}
                    on:click={checkKey}
                >
                    {joinActionText}
                    {#if $formActionButtonDisabled && joinActionText == "Checking..."}
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
                on:click={createChat}>Create a chat?</button
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
