<script context="module" lang="ts">
    import { get } from "svelte/store";

    export const sendMethod: Writable<SEND_METHOD> = writable(SEND_METHOD.ENTER);
    export const buttonSoundEnabled = writable(true);
    export const messageSoundEnabled = writable(true);
    export const quickEmojiEnabled = writable(true);
    export const quickEmoji = writable('');
    export const linkPreviewOn = writable(true);

    type Settings = {
        buttonSoundEnabled: boolean;
        messageSoundEnabled: boolean;
        quickEmojiEnabled: boolean;
        quickEmoji: string;
        selectedStickersGroup: string;
        currentTheme: string;
        sendMethod: SEND_METHOD;
        linkPreviewOn: boolean;
    };

    const defaultSettings = {
        buttonSoundEnabled: true,
        messageSoundEnabled: true,
        quickEmojiEnabled: true,
        linkPreviewOn: true,
        sendMethod:
            get(deviceType) == "mobile"
                ? SEND_METHOD.CTRL_ENTER
                : SEND_METHOD.ENTER,
    };

    function setChatSettings(parsedSettings: Partial<Settings>) {
        buttonSoundEnabled.set(
            parsedSettings.buttonSoundEnabled ??
                defaultSettings.buttonSoundEnabled,
        );
        messageSoundEnabled.set(
            parsedSettings.messageSoundEnabled ??
                defaultSettings.messageSoundEnabled,
        );
        quickEmojiEnabled.set(
            parsedSettings.quickEmojiEnabled ??
                defaultSettings.quickEmojiEnabled,
        );
        quickEmoji.set(
            parsedSettings.quickEmoji ?? themes[DEFAULT_THEME].quickEmoji,
        );
        selectedStickerGroup.set(
            parsedSettings.selectedStickersGroup ?? DEFAULT_STICKER_GROUP,
        );
        currentTheme.set(parsedSettings.currentTheme ?? DEFAULT_THEME);
        sendMethod.set(parsedSettings.sendMethod ?? defaultSettings.sendMethod);
        linkPreviewOn.set(
            parsedSettings.linkPreviewOn ?? defaultSettings.linkPreviewOn,
        );
    }

    export function setToLocalStorage(updatedSettings: Partial<Settings>) {
        const currentSettingsStr = localStorage.getItem("settings") || "{}";
        const currentSettings: Settings = JSON.parse(currentSettingsStr);

        const newSettings: Settings = {
            ...currentSettings,
            ...updatedSettings,
        };

        localStorage.setItem("settings", JSON.stringify(newSettings));
    }

    export function loadChatSettings() {
        const settingsStr = localStorage.getItem("settings") || "{}";
        try {
            const parsedSettings: Partial<Settings> = JSON.parse(settingsStr);

            if (
                typeof parsedSettings.buttonSoundEnabled != "boolean" ||
                typeof parsedSettings.messageSoundEnabled != "boolean" ||
                typeof parsedSettings.quickEmojiEnabled != "boolean" ||
                typeof parsedSettings.sendMethod != "string" ||
                typeof parsedSettings.linkPreviewOn != "boolean"
            ) {
                throw new Error("Invalid settings");
            } else {
                if (
                    parsedSettings.sendMethod != SEND_METHOD.ENTER &&
                    parsedSettings.sendMethod != SEND_METHOD.CTRL_ENTER
                ) {
                    throw new Error("Invalid settings");
                } else {
                    setChatSettings(parsedSettings);
                }
            }
        } catch (error) {
            // Store the default settings
            localStorage.setItem("settings", JSON.stringify(defaultSettings));
            console.log("Default settings stored");
            // Update the settings to the default settings
            setChatSettings({ ...defaultSettings });
        }
    }
</script>

<script lang="ts">
    import { fly } from "svelte/transition";
    import { type Writable, writable } from "svelte/store";
    import {
        chatRoomStore,
        deviceType,
        myId,
        splashMessage,
    } from "$lib/store";
    import { SEND_METHOD } from "$lib/types";
    import EmojiPicker from "./emojiPicker.svelte";
    import { spin } from "$lib/utils";
    import { socket } from "$lib/socket";
    import { showToastMessage } from "@itsfuad/domtoastmessage";
    import UsersPanel from "./usersPanel.svelte";
    import { addState, clearModals } from "../stateManager.svelte";
    import { onDestroy, onMount } from "svelte";
    import type { Unsubscriber } from "svelte/store";
    import { DEFAULT_THEME, currentTheme, themes } from "$lib/themes";
    import {
        DEFAULT_STICKER_GROUP,
        selectedStickerGroup,
    } from "./stickersKeyboard.svelte";

    let showQuickEmojiDrawer = false;

    const version = __VERSION__;

    loadChatSettings();

    function handleClick(node: HTMLElement) {
        const click = (e: Event) => {
            const target = e.target as HTMLElement;

            if (target == node) {
                history.back();
            } else if (target.id) {
                switch (target.id) {
                    case "back":
                        history.back();
                        break;
                    case "buttonSound":
                        setToLocalStorage({
                            buttonSoundEnabled: !$buttonSoundEnabled,
                        });
                        break;
                    case "messageSound":
                        setToLocalStorage({
                            messageSoundEnabled: !$messageSoundEnabled,
                        });
                        break;
                    case "linkPreview":
                        setToLocalStorage({
                            linkPreviewOn: !$linkPreviewOn,
                        });
                        break;
                    case "quickEmoji":
                        setToLocalStorage({
                            quickEmojiEnabled: !$quickEmojiEnabled,
                        });
                        break;
                    case "ctrl+enter":
                        setToLocalStorage({
                            sendMethod: SEND_METHOD.CTRL_ENTER,
                        });
                        break;
                    case "enter":
                        setToLocalStorage({ sendMethod: SEND_METHOD.ENTER });
                        break;
                    case "chooseQuickEmoji":
                        showQuickEmojiDrawer = !showQuickEmojiDrawer;
                        break;
                    case "themeButton":
                        addState("themes", { showThemesPanel: true });
                        break;
                }
            }
        };

        node.onclick = click;

        return {
            destroy() {
                node.onclick = null;
                showQuickEmojiDrawer = false;
            },
        };
    }

    function leaveChat(destroy: boolean = false) {
        splashMessage.set(
            (destroy ? "Destroying chat... " : "Leaving chat... ") +
                '<img src="/images/run-pikachu.gif" alt="exit" height="30px" width="30px" />',
        );
        clearModals();
        socket.emit("leaveChat", destroy);
    }

    $: KEY = $chatRoomStore.Key;

    let copyKeyIcon = "fa-regular fa-clone";
    let copyTimeout: number | null = null;

    function copyKey() {
        navigator.clipboard
            .writeText($chatRoomStore.Key)
            .then(() => {
                showToastMessage("Copied to clipboard!");
                copyKeyIcon = "fa-solid fa-check";
                if (copyTimeout) clearTimeout(copyTimeout);
                copyTimeout = setTimeout(() => {
                    copyKeyIcon = "fa-regular fa-clone";
                }, 1000);
            })
            .catch((err) => {
                showToastMessage("Failed to copy");
            });
    }

    let quickEmojiSub: Unsubscriber;

    onMount(() => {
        quickEmojiSub = quickEmoji.subscribe((value) => {
            setToLocalStorage({ quickEmoji: value });
        });
    });

    onDestroy(() => {
        quickEmojiSub();
    });
</script>

<div class="settingsWrapper" use:handleClick>
    <div
        class="settings box-shadow back-blur"
        in:fly={{ x: 40, duration: 150, opacity: 1 }}
        out:fly={{ x: 40, duration: 150 }}
    >
        <div class="top">
            <button
                id="back"
                class="back button-animate clickable hover roundedBtn"
            >
                <i class="fa-solid fa-chevron-left" />
            </button>
            <div class="v-title">v{version}</div>
        </div>

        <div class="subsectionsContainer">
            <button id="keyname" class="play-sound clickable" on:click={copyKey}
                ><i class={copyKeyIcon}></i>Copy chat key: {KEY}</button
            >

            {#if $chatRoomStore.userList && Object.keys($chatRoomStore.userList).length > 0}
                <div class="subsection">
                    <div class="subtitle">
                        {Object.keys($chatRoomStore.userList).length } People{Object.keys($chatRoomStore.userList).length > 1 ? "'s" : ""} <i class="fa-solid fa-users"></i>
                    </div>
                    <UsersPanel />
                </div>
            {/if}

            <div class="subtitle sectionHeadTitle">
                Customize chat <i class="fa-solid fa-dice"></i>
            </div>

            <div class="subsection">
                <div class="subtitle">
                    Sounds & Notifications <i class="fa-solid fa-volume-high" />
                </div>
                <!-- Enable/disable button sounds -->
                <div class="field-checkers play-sound hoverShadow">
                    <input
                        type="checkbox"
                        id="buttonSound"
                        bind:checked={$buttonSoundEnabled}
                    />
                    <label for="buttonSound">
                        <div class="textContainer">
                            Click Sound
                            <div class="moreInfo">
                                Buttons and UI elements sound
                            </div>
                        </div>
                        <span class="toggleButton" />
                    </label>
                </div>
                <!-- Enable/disable message sounds -->
                <div class="field-checkers play-sound hoverShadow">
                    <input
                        type="checkbox"
                        id="messageSound"
                        bind:checked={$messageSoundEnabled}
                    />
                    <label for="messageSound">
                        <div class="textContainer">
                            Message sound
                            <div class="moreInfo">
                                Message action sound (send, recieve, reacts)
                            </div>
                        </div>
                        <span class="toggleButton" />
                    </label>
                </div>
            </div>

            <div class="subsection">
                <div class="subtitle">
                    Link Preview <i class="fa-solid fa-link" />
                </div>
                <div class="field-checkers play-sound hoverShadow">
                    <input
                        type="checkbox"
                        id="linkPreview"
                        bind:checked={$linkPreviewOn}
                    />
                    <label for="linkPreview">
                        <div class="textContainer">
                            Enable link preview
                            <div class="moreInfo">
                                Show link preview for shared links
                            </div>
                        </div>
                        <span class="toggleButton" />
                    </label>
                </div>
            </div>

            <div class="subsection">
                <div class="subtitle">
                    Keyboard <i class="fa-regular fa-keyboard" />
                </div>
                <div class="field-checkers play-sound hoverShadow">
                    <input
                        bind:group={$sendMethod}
                        type="radio"
                        name="sendMethod"
                        id="ctrl+enter"
                        value="Ctrl+Enter"
                    />
                    <label for="ctrl+enter">
                        <div class="textContainer">
                            Use Ctrl+Enter to send
                            <div class="moreInfo">Enter to add newlines</div>
                        </div>
                        <span class="toggleButton" />
                    </label>
                </div>

                <div class="field-checkers play-sound hoverShadow">
                    <input
                        bind:group={$sendMethod}
                        type="radio"
                        name="sendMethod"
                        id="enter"
                        value="Enter"
                    />
                    <label for="enter">
                        <div class="textContainer">
                            Use Enter to send
                            <div class="moreInfo">
                                Shift+Enter to add newlines
                            </div>
                        </div>
                        <span class="toggleButton" />
                    </label>
                </div>
            </div>

            <!--Themes and emoji-->
            <div class="subsection">
                <div class="subtitle">
                    Themes & emoji <i class="fa-solid fa-palette"></i>
                </div>
                <div class="field-checkers play-sound hoverShadow">
                    <input
                        bind:checked={$quickEmojiEnabled}
                        type="checkbox"
                        id="quickEmoji"
                    />
                    <label for="quickEmoji">
                        <div class="textContainer">
                            Enable quick emoji
                            <div class="moreInfo">
                                Use send button to send a quick emoji
                            </div>
                        </div>
                        <span class="toggleButton" />
                    </label>
                </div>
                <div
                    class="field-checkers play-sound hoverShadow"
                    id="chooseQuickEmoji"
                >
                    <div class="wrapper">
                        <div class="label">
                            Change quick emoji
                            <div class="moreInfo">
                                Choose a quick emoji to send
                            </div>
                        </div>
                        {#if showQuickEmojiDrawer}
                            <i
                                in:spin={{ duration: 200, degree: 180 }}
                                id="closeQuickEmojiDrawer"
                                class="fa-solid fa-caret-down"
                            ></i>
                        {:else}
                            <button
                                in:spin={{ duration: 200, degree: 180 }}
                                class="hyper"
                                id="chooseQuickEmojiButton"
                            >
                                {$quickEmoji}
                            </button>
                        {/if}
                    </div>
                </div>
                {#if showQuickEmojiDrawer}
                    <EmojiPicker
                        height="10rem"
                        bind:selectedEmoji={$quickEmoji}
                        onClose={() => {
                            showQuickEmojiDrawer = false;
                        }}
                    />
                {/if}
                <div
                    id="themeButton"
                    class="field-checkers play-sound hoverShadow"
                    title="Select themes [Alt+t]"
                >
                    <div class="wrapper">
                        Change theme
                        <div class="moreInfo">Change the look of the chat</div>
                    </div>
                    <i class="fa-solid fa-brush" />
                </div>
            </div>

            <div class="subsection danger-zone">
                <div class="subtitle sectionHeadTitle red">
                    Danger zone <i class="fa-solid fa-skull"></i>
                </div>
                <ul class="moreInfo">
                    {#if $chatRoomStore.admin == $myId}
                        <li>Destroy chat will end the chat session for all</li>
                    {/if}
                    <li>Leave chat will end the chat session for you</li>
                </ul>
                <div class="btn-grp">
                    {#if $chatRoomStore.admin == $myId}
                        <button
                            on:click={() => leaveChat(true)}
                            id="destroy"
                            class="button hover button-animate play-sound capsule"
                            title="Leave and end chat"
                        >
                            Destroy chat <i class="fa-solid fa-trash" />
                        </button>
                    {/if}
                    <button
                        on:click={() => leaveChat(false)}
                        id="logoutButton"
                        class="button hover button-animate play-sound capsule"
                        ><i class="fa-solid fa-arrow-right-from-bracket"
                        ></i>Leave chat
                    </button>
                </div>

                <div class="feedback">
                    <a href="mailto:itsfuad@programmer.net">
                        Provide feedback <i class="fa-solid fa-envelope"></i>
                    </a>
                    <div class="moreInfo">
                        Report bugs, suggest features, or just say hi!
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style lang="scss">

    .v-title{
        color: var(--transparent-white-color);
        font-size: 0.7rem;
    }

    #keyname {
        border-radius: 10px;
        font-weight: 300;
        color: var(--secondary-dark) !important;
        * {
            color: var(--secondary-dark) !important;
            padding: 5px;
            cursor: pointer;
            font-size: 1rem;
        }
    }

    .fa-brush {
        font-size: 2.2rem;
        color: var(--secondary-dark);
        padding: 5px 10px;
    }

    a {
        color: inherit;
    }

    .feedback {
        padding: 10px 0 10px;
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        a {
            color: var(--secondary-dark);
            text-decoration: underline;
            font-size: 0.8rem;
            i {
                color: inherit;
            }
        }
    }

    #back {
        i {
            pointer-events: none;
        }
    }

    .settingsWrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        transition: 200ms;
        //background: #aaa;
        z-index: 100;
    }

    .danger-zone {
        .btn-grp {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
            justify-content: center;
            width: 100%;

            & > button {
                min-width: fit-content;
                flex: 1;
            }
        }
    }

    #destroy {
        background: red;
    }

    #logoutButton {
        background: #000000;
        color: inherit;
        &:hover {
            background: #141414;
        }
    }

    .red {
        color: red !important;
        * {
            color: red !important;
        }
    }

    input {
        display: none;
    }

    .moreInfo {
        font-size: 0.7rem;
        color: var(--transparent-white-color);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        text-align: left;
        gap: 5px;

        * {
            color: inherit;
            font-size: inherit;
        }

        li {
            margin-left: 25px;
            list-style: disc;
        }
    }

    .field-checkers {
        display: flex;
        position: relative;
        cursor: pointer;
        user-select: none;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 5px;
        padding: 5px 10px;
        width: 100%;
        border-radius: 10px;
        font-size: 0.8rem;

        input {
            cursor: pointer;
            &:checked ~ label .toggleButton {
                background: var(--secondary-dark);
                &::after {
                    transform: translateX(20px);
                }
            }
        }

        label {
            width: max-content;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            text-align: right;
            width: 100%;
            gap: 5px;
            cursor: pointer;
            .textContainer {
                display: flex;
                justify-content: center;
                flex-direction: column;
                align-items: flex-start;
                font-size: 0.8rem;
            }

            .toggleButton {
                position: relative;
                width: 40px;
                height: 20px;
                background: #fdfdfd1f;
                display: flex;
                border-radius: 25px;
                transition: 300ms ease-in-out;
                &::after {
                    content: "";
                    position: absolute;
                    height: 20px;
                    width: 20px;
                    border-radius: 50px;
                    background: white;
                    inset: 0;
                    transition: 300ms ease-in-out;
                    transform: translateX(0px);
                }
            }
        }
    }

    #themeButton {
        * {
            pointer-events: none;
        }
    }

    #chooseQuickEmojiButton {
        color: var(--secondary-dark);
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: 100ms ease-in-out;
        pointer-events: none;
    }

    #chooseQuickEmoji {
        .wrapper {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 5px;
            width: 100%;
            pointer-events: none;
        }

        button,
        i {
            font-size: 2rem;
            padding: inherit;
            color: var(--secondary-dark);
        }
    }

    .settings {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding: 10px 10px 0 10px;
        gap: 10px;
        background: var(--modal-color);
        height: 100%;
        width: 400px;
        max-width: 85vw;
        position: relative;
        font-size: 0.7rem;
        transition: 100ms ease-in-out;

        .top {
            width: 100%;
            padding: 0 0 5px;
            //border-bottom: 2px solid var(--dark-color);
            color: white;
            font-size: 0.9rem;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }

        .subsectionsContainer {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 10px;
            width: 100%;
            height: 100%;
            overflow-y: scroll;
            .subsection {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                gap: 10px;
                width: 100%;
                &.btn-grp {
                    flex-direction: row;
                }
            }
        }
    }

    .subtitle {
        font-size: 0.9rem;
        color: var(--secondary-dark);
        padding-bottom: 5px;

        i {
            font-size: inherit;
            color: inherit;
        }

        &.sectionHeadTitle {
            width: 100%;
            margin-top: 10px;
            text-align: center;
        }
    }
</style>
