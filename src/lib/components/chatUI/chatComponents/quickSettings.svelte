<script lang="ts">
    import { fly } from "svelte/transition";
    import {
    clearModals,
        showQuickSettingsPanel,
        showThemesPanel,
    } from "$lib/components/modalManager";
    import {
        buttonSoundEnabled,
        chatRoomStore,
        currentPage,
        joinedChat,
        messageSoundEnabled,
        myId,
        quickEmoji,
        quickEmojiEnabled,
        SEND_METHOD,
        sendMethod,
        splashMessage,
    } from "$lib/store";
    import EmojiPicker from "./emojiPicker.svelte";
    import { spin } from "$lib/utils";
    import { socket } from "$lib/components/socket";
    import { messageDatabase } from "$lib/messageTypes";
    import { showToastMessage } from "$lib/components/toast";
    import UsersPanel from "./usersPanel.svelte";
    import { bounceOut, elasticOut } from "svelte/easing";

    type Settings = {
        buttonSoundEnabled: boolean;
        messageSoundEnabled: boolean;
        quickEmojiEnabled: boolean;
        sendMethod: SEND_METHOD;
    };

    const defaultSettings = {
        buttonSoundEnabled: true,
        messageSoundEnabled: true,
        quickEmojiEnabled: true,
        sendMethod: SEND_METHOD.ENTER,
    };

    let showQuickEmojiDrawer = false;

    function setDefaultChatSettings() {
        sendMethod.set(defaultSettings.sendMethod);
        buttonSoundEnabled.set(defaultSettings.buttonSoundEnabled);
        messageSoundEnabled.set(defaultSettings.messageSoundEnabled);
        quickEmojiEnabled.set(defaultSettings.quickEmojiEnabled);
    }

    function loadChatSettings() {
        //console.log("Loading settings");
        const settingsStr = localStorage.getItem("settings") || "{}";
        try {
            const parsedSettings: Partial<Settings> = JSON.parse(settingsStr);
            //console.log(parsedSettings);

            if (
                typeof parsedSettings.buttonSoundEnabled != "boolean" ||
                typeof parsedSettings.messageSoundEnabled != "boolean" ||
                typeof parsedSettings.quickEmojiEnabled != "boolean" ||
                typeof parsedSettings.sendMethod != "string"
            ) {
                throw new Error("Invalid settings");
            } else {
                if (
                    parsedSettings.sendMethod != SEND_METHOD.ENTER &&
                    parsedSettings.sendMethod != SEND_METHOD.CTRL_ENTER
                ) {
                    throw new Error("Invalid settings");
                } else {
                    buttonSoundEnabled.set(parsedSettings.buttonSoundEnabled);
                    messageSoundEnabled.set(parsedSettings.messageSoundEnabled);
                    quickEmojiEnabled.set(parsedSettings.quickEmojiEnabled);
                    sendMethod.set(parsedSettings.sendMethod);
                }
            }
        } catch (error) {
            console.log("Error parsing settings:", error);
            // Store the default settings
            localStorage.setItem("settings", JSON.stringify(defaultSettings));
            console.log("Default settings stored");
            // Update the settings to the default settings
            setDefaultChatSettings();
        }
    }

    loadChatSettings();

    function setToLocalStorage(updatedSettings: Partial<Settings>) {
        const currentSettingsStr = localStorage.getItem("settings") || "{}";
        const currentSettings: Settings = JSON.parse(currentSettingsStr);

        const newSettings: Settings = {
            ...currentSettings,
            ...updatedSettings,
        };

        localStorage.setItem("settings", JSON.stringify(newSettings));
    }

    function handleClick(node: HTMLElement) {
        const click = (e: Event) => {
            const target = e.target as HTMLElement;

            if (target == node) {
                showQuickSettingsPanel.set(false);
            } else if (target.id) {
                if (target.id == "back") {
                    showQuickSettingsPanel.set(false);
                } else if (target.id == "buttonSound") {
                    setToLocalStorage({
                        buttonSoundEnabled: !$buttonSoundEnabled,
                    });
                } else if (target.id == "messageSound") {
                    setToLocalStorage({
                        messageSoundEnabled: !$messageSoundEnabled,
                    });
                } else if (target.id == "quickEmoji") {
                    setToLocalStorage({
                        quickEmojiEnabled: !$quickEmojiEnabled,
                    });
                } else if (target.id == "ctrl+enter") {
                    setToLocalStorage({ sendMethod: SEND_METHOD.CTRL_ENTER });
                } else if (target.id == "enter") {
                    setToLocalStorage({ sendMethod: SEND_METHOD.ENTER });
                } else if (target.id == "chooseQuickEmoji") {
                    showQuickEmojiDrawer = !showQuickEmojiDrawer;
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

    function leaveChat(){
        console.log('Leaving chat...');
        splashMessage.set('Leaving Chat');
        clearModals();
        socket.emit('leaveChat', () => {
            console.log('Left chat');
            chatRoomStore.set({
                Key: '',
                userList: {},
                maxUsers: 2,
            });
            myId.set('');
            messageDatabase.reset();
            joinedChat.set(false);
            currentPage.set('form');
            splashMessage.set('');
        });
    }

    $: KEY = $chatRoomStore.Key;

    let copyKeyIcon = 'fa-regular fa-clone';
    let copyTimeout: number | null = null;

    function copyKey(){
        navigator.clipboard.writeText($chatRoomStore.Key).then(() => {
            showToastMessage('Copied to clipboard!');
            copyKeyIcon = 'fa-solid fa-check';
            if (copyTimeout) clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
                copyKeyIcon = 'fa-regular fa-clone';
            }, 1000);
        })
        .catch(err => {
            console.log(err);
            showToastMessage('Failed to copy');
        });
    }

</script>

<div class="settingsWrapper" use:handleClick>
    <div class="settings" 
        in:fly={{ x: 40, duration: 400, easing: elasticOut, opacity: 1 }}
        out:fly={{ x: 40, duration: 100}}
    >
        
        <div class="top">
            <button
                id="back"
                class="back button-animate clickable hover roundedBtn"
            >
                <i class="fa-solid fa-chevron-left" />
            </button>
        </div>

        

        <div class="subsectionsContainer">
            
            <button id="keyname" class="btn play-sound clickable" on:click={copyKey}><i class="{copyKeyIcon}"></i>Copy chat key: {KEY}</button>
            
            <div class="subsections">
                <div class="subtitle">
                    Peoples on this chat <i class="fa-solid fa-users"></i>
                </div>
                <UsersPanel />
            </div>

            <div class="subtitle sectionHeadTitle">
                Customize chat <i class="fa-solid fa-gears"></i>
            </div>

            <div class="subsections">
                <div
                    class="subtitle">
                    Sounds <i class="fa-solid fa-volume-high" />
                </div>
                <!-- Enable/disable button sounds -->
                <div
                    class="field-checkers btn play-sound hoverShadow">
                    <input
                        type="checkbox"
                        id="buttonSound"
                        bind:checked={$buttonSoundEnabled}
                    />
                    <label for="buttonSound">
                        <div class="textContainer">Click Sound</div>
                        <span class="toggleButton" />
                    </label>
                </div>
                <!-- Enable/disable message sounds -->
                <div
                    class="field-checkers btn play-sound hoverShadow">
                    <input
                        type="checkbox"
                        id="messageSound"
                        bind:checked={$messageSoundEnabled}
                    />
                    <label for="messageSound">
                        <div class="textContainer">Message sound</div>
                        <span class="toggleButton" />
                    </label>
                </div>
            </div>


            <div class="subsections">
                <div
                    class="subtitle">
                    Keyboard <i class="fa-regular fa-keyboard" />
                </div>
                <div
                    class="field-checkers keyboardMode btn play-sound hoverShadow">
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

                <div
                    class="field-checkers keyboardMode btn play-sound hoverShadow">
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


            <!--Quick emoji-->
            <div class="subsections">
                <div
                    class="subtitle">
                    Quick emoji <i class="fa-solid fa-face-smile-wink"></i>
                </div>
                <div
                    class="field-checkers btn play-sound hoverShadow">
                    <input
                        bind:checked={$quickEmojiEnabled}
                        type="checkbox"
                        id="quickEmoji"
                    />
                    <label for="quickEmoji">
                        <div class="textContainer">Enable quick emoji</div>
                        <span class="toggleButton" />
                    </label>
                </div>
                <div
                    class="field-checkers btn play-sound hoverShadow"
                    id="chooseQuickEmoji">
                    <div class="wrapper">
                        <div class="label">Change quick emoji</div>
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
            </div>


            <div class="footer_options">
                <button
                    id="themeButton"
                    on:click={() => {
                        showThemesPanel.set(true);
                        showQuickSettingsPanel.set(false);
                    }}
                    class="button btn play-sound hover"
                    title="Select themes [Alt+t]"
                    ><i class="fa-solid fa-palette" />Change themeButton<i
                        class="fa-solid fa-brush"
                    />
                </button>
                <button
                    on:click={leaveChat}
                    id="logoutButton"
                    class="button hover button-animate small btn play-sound"
                    ><i class="fa-solid fa-arrow-right-from-bracket"></i>Leave chat
                    </button
                >
                <div class="feedback">
                    <a href="mailto:itsfuad@programmer.net">
                        Provide feedback <i class="fa-solid fa-envelope"></i>
                    </a>
                    <div class="moreInfo">
                        Report bugs, suggest features, or just say hi!
                    </div>
                </div>
                <div class="footer">
                    <div class="location">
                        Dhaka - 1700, Bangladesh <i class="fa-solid fa-location-dot"></i>
                    </div>
                    <a href="https://www.flaticon.com/free-icons/pokemon" title="pokemon icons">Assets <i class="fa-solid fa-compass-drafting"></i></a>
                </div>
            </div>

        </div>
    </div>
</div>

<style lang="scss">

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

    .footer{
        font-size: 0.7rem;
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: center;
        align-items: center;
        gap: 10px;
        
        i {
            color: inherit;
        }
    }

    a{
        color: inherit;
    }

    .feedback{
        margin-top: 20px;
        a{
            color: var(--secondary-dark);
            text-decoration: none;
            font-size: 0.8rem;
            i {
                color: inherit;
            }
            &:hover{
                text-decoration: underline;
            }
        }
    }

    #back{
        i{
            pointer-events: none;
        }
    }


    .settingsWrapper {
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-end;
        //background: #aaa;
        z-index: 100;
    }

    .footer_options {
        display: flex;
        flex-direction: column;
        width: 100%;
        padding: 10px;
        gap: 10px;
        align-items: flex-start;
        justify-content: space-between;

        button{
            width: 100%;
        }

        #themeButton {
            background: var(--secondary-dark);
        }

        #logoutButton {
            background: red;
            font-size: 0.8rem;
            color: inherit;
        }
    }

    input {
        display: none;
    }

    .moreInfo {
        font-size: 0.7rem;
        color: grey;
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
                background: #aaa;
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
                    top: 0;
                    left: 0;
                    transition: 300ms ease-in-out;
                    transform: translateX(0px);
                }
            }
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
        background: var(--primary-dark);
        height: 100%;
        width: 400px;
        max-width: 85vw;
        position: relative;
        //filter: drop-shadow(2px 4px 6px var(--shadow));
        font-size: 0.7rem;
        transition: 0.1s ease-in-out;

        .top {
            width: 100%;
            padding: 0 0 5px;
            //border-bottom: 2px solid var(--option-color);
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
            .subsections {
                width: 100%;
            }
            .subtitle {
                font-size: 0.9rem;
                color: var(--secondary-dark);
                padding-bottom: 5px;

                &.sectionHeadTitle{
                    margin-top: 10px;
                }
            }
        }
    }
</style>
