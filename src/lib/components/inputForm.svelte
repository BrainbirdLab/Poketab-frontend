<script lang="ts">
    import "./forms.scss";
    import { avList } from "$lib/utils/validation";
    import { fly, scale } from "svelte/transition";
    import { onDestroy, onMount } from "svelte";

    import {
        socket,
        reConnectSocket,
        type socketResponse,
    } from "$lib/components/socket";
    import {
        formActionButtonDisabled,
        reconnectButtonEnabled,
        showUserInputForm,
        chatRoomStore,
        myId,
        socketConnected,
        joinedChat,
        isTaken,
        currentPage,
        formNotification,
        splashMessage,
    } from "$lib/store";

    let selectedpokemon = "";
    let selectedMaxUser = 2;

    let pokemonErr = "";
    let maxUserErr = "";

    let errAnimation = "";

    $: {
        if (pokemonErr || maxUserErr) {
            errAnimation = "shake";
            setTimeout(() => {
                errAnimation = "";
            }, 100);
        } else {
            errAnimation = "";
        }
    }

    $: actionButtonText = $chatRoomStore.Key ? "Join" : "Create";

    let mounted = false;

    if ($chatRoomStore.Key) {
        socket.emit(
            "fetchKeyData",
            $chatRoomStore.Key,
            false,
            (res: socketResponse) => {
                if (!res.success) {
                    showUserInputForm.set(false);
                } else {
                    chatRoomStore.update((room) => {
                        room.userList = res.users;
                        return room;
                    });
                    showUserInputForm.set(true);
                }
            },
        );
    }

    onMount(() => {
        mounted = true;
    });

    onDestroy(() => {
        pokemonErr = "";
        maxUserErr = "";
    });

    function requestForChat(evt: Event) {
        evt.preventDefault();

        console.log("Requesting for chat");

        pokemonErr = "";
        maxUserErr = "";

        if (!selectedpokemon) {
            pokemonErr = "Please choose a pokemon";
            return;
        }

        if (
            (!$chatRoomStore.Key && selectedMaxUser < 2) ||
            selectedMaxUser > 10
        ) {
            maxUserErr = "Max users must be between 2 and 10";
            return;
        }

        if (isTaken(selectedpokemon)) {
            pokemonErr = "Pokemon is already in use";
            return;
        }

        console.log("%cValidation Passed", "color: green");

        console.log("Connecting to chat...");

        //initChatActionDisabled = true;
        formActionButtonDisabled.set(true);
        actionButtonText = "Please wait ";

        if (!$chatRoomStore.Key) {
            console.log("Creating chat...");
            //console.log(`pokemon: ${get(selfInfoStore).pokemon}, Max user: ${get(chatRoomStore).maxUsers}`);
            socket.emit(
                "createChat",
                selectedpokemon,
                selectedMaxUser,
                (res: {
                    success: boolean;
                    message: string;
                    key: string;
                    userId: string;
                }) => {
                    if (!res.success) {
                        console.log("Error: " + res.message);
                        formNotification.set("Error: " + res.message);
                        formActionButtonDisabled.set(false);
                        //showUserInputForm.set(false);
                        return;
                    }

                    chatRoomStore.update((room) => {
                        room.Key = res.key;
                        room.admin = res.userId;
                        room.maxUsers = selectedMaxUser;
                        return room;
                    });

                    myId.set(res.userId);

                    console.log("Created key: " + $chatRoomStore.Key);

                    joinedChat.set(true);
                    currentPage.set("chat");
                    splashMessage.set("");
                    selectedpokemon = "";
                    selectedMaxUser = 2;
                    formActionButtonDisabled.set(false);
                },
            );
        } else {
            console.log("Joining key: " + $chatRoomStore.Key);
            socket.connect();
            socket.emit(
                "joinChat",
                $chatRoomStore.Key,
                selectedpokemon,
                (res: {
                    success: boolean;
                    message: string;
                    userId: string;
                    admin: string;
                    maxUsers: number;
                }) => {
                    if (!res.success) {
                        console.log("Error: " + res.message);
                        formNotification.set("Error: " + res.message);
                        formActionButtonDisabled.set(false);
                        showUserInputForm.set(false);
                        return;
                    }

                    chatRoomStore.update((room) => {
                        room.admin = res.admin;
                        room.maxUsers = res.maxUsers;
                        return room;
                    });

                    myId.set(res.userId);

                    console.log("Joined key: " + $chatRoomStore.Key);

                    joinedChat.set(true);
                    currentPage.set("chat");
                    splashMessage.set("");
                    selectedpokemon = "";
                    selectedMaxUser = 2;
                    formActionButtonDisabled.set(false);
                },
            );
        }
    }

    function redirect() {
        showUserInputForm.set(false);
    }
</script>

<svelte:head>
    <title>Poketab - {actionButtonText}</title>
</svelte:head>

{#if mounted}
    <div class="formWrapper">
        <div class="form back-blur" in:fly={{ y: 30 }}>
            <div class="formtitle">
                {#if !$chatRoomStore.Key}
                    Create chat <i class="fa-solid fa-meteor"></i>
                {:else}
                    Join chat <i class="fa-solid fa-handshake"></i>
                {/if}
            </div>
            <div class="formfield">
                <label for="pokemon" class:error={pokemonErr} class:selected={selectedpokemon}>
                    {#if pokemonErr}
                    {pokemonErr}
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    {:else}
                        Pick your pokemon <i class="fa-solid fa-user-astronaut"></i>
                    {/if}
                </label>
                <div id="pokemon" class="pokemonsContainer">
                    <div class="pokemons">
                        {#each avList as pokemon, i}
                            {#if $chatRoomStore.Key && isTaken(pokemon)}
                                <div
                                    class="pokemon inuse"
                                    in:fly|global={{ x: 10, delay: i * 30 }}
                                >
                                    <label
                                        class="pokemonLabel btn-animate"
                                        for=""
                                    >
                                        <img
                                            src="/images/pokemons/{pokemon}(custom).webp"
                                            alt={pokemon}
                                        />
                                    </label>
                                </div>
                            {:else}
                                <div
                                    class="pokemon"
                                    in:scale|global={{ delay: i * 30 }}
                                >
                                    <input
                                        type="radio"
                                        class="pokemonInput"
                                        on:input={() => (pokemonErr = "")}
                                        bind:group={selectedpokemon}
                                        name="pokemon"
                                        value={pokemon}
                                        id={pokemon}
                                    />
                                    <label
                                        class="pokemonLabel btn-animate"
                                        for={pokemon}
                                    >
                                        <img
                                            loading="lazy"
                                            src="/images/pokemons/{pokemon}(custom).webp"
                                            alt={pokemon}
                                        />
                                    </label>
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            </div>

            {#if !$chatRoomStore.Key}
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
                {#if $reconnectButtonEnabled}
                    <button
                        class="button-animate hover play-sound recon"
                        on:click={reConnectSocket}>Reconnect</button
                    >
                {:else}
                    <button
                        class="button-animate hover play-sound"
                        disabled={$formActionButtonDisabled ||
                            !$socketConnected}
                        on:click={requestForChat}
                    >
                        {actionButtonText}
                        {#if $formActionButtonDisabled && actionButtonText.includes("Please wait")}
                            <i class="fa-solid fa-spin fa-circle-notch"></i>
                        {/if}
                    </button>
                {/if}
            </div>

            <div class="redirect">
                <span class="redir-label">Or may be you want to</span>
                <button
                    id="redirect"
                    class="noSelect button-animate hover play-sound"
                    on:click={redirect}>Join a chat?</button
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
        background: var(--dark-color);
        border-radius: 3px;
        border: 0px solid #000000;
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
    }

    input[type="range"]:focus::-webkit-slider-runnable-track {
        filter: brightness(0.95);
    }

    input[type="range"]::-moz-range-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        box-shadow: 0px 0px 0px #000000;
        background: var(--dark-color);
        border-radius: 3px;
        border: 0px solid #000000;
    }

    input[type="range"]::-moz-range-thumb {
        box-shadow: 0px 0px 0px #000000;
        height: 18px;
        width: 18px;
        border-radius: 25px;
        background: var(--secondary-dark, #4598ff);
        cursor: pointer;
    }

    input[type="range"]::-ms-track {
        width: 100%;
        height: 5px;
        cursor: pointer;
        background: transparent;
        border-color: transparent;
        color: transparent;
    }

    input[type="range"]::-ms-fill-lower {
        background: var(--dark-color);
        border: 0px solid #000000;
        border-radius: 2px;
        box-shadow: 0px 0px 0px #000000;
    }

    input[type="range"]::-ms-fill-upper {
        background: var(--dark-color);
        border: 0px solid #000000;
        border-radius: 2px;
        box-shadow: 0px 0px 0px #000000;
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
    }

    input[type="range"]:focus::-ms-fill-lower {
        filter: brightness(0.95);
    }

    input[type="range"]:focus::-ms-fill-upper {
        filter: brightness(0.95);
    }

    .pokemonsContainer {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 5px;
        .pokemons {
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
            .pokemon {
                background: #ffffff0d;
                border-radius: 50%;
                .pokemonLabel {
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
                    .pokemonLabel {
                        cursor: not-allowed;
                    }
                }

                &:not(.inuse):hover {
                    .pokemonLabel {
                        filter: saturate(100%);
                    }
                }
            }

            .pokemonInput:checked + .pokemonLabel {
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
