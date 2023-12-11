<script lang="ts">
    import { fly, scale } from "svelte/transition";
    import { showQuickSettingsPanel, showThemesPanel } from "./modalManager";
    import { currentTheme, buttonSoundEnabled, messageSoundEnabled, quickEmojiEnabled, SEND_METHOD, sendMethod} from "$lib/store";
    import { themesMap } from "$lib/themes";

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

    function setDefaultChatSettings(){
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
            
            if (typeof parsedSettings.buttonSoundEnabled != "boolean" || typeof parsedSettings.messageSoundEnabled != "boolean" || typeof parsedSettings.quickEmojiEnabled != "boolean" || typeof parsedSettings.sendMethod != "string") {
                throw new Error("Invalid settings");
            } else {
                if (parsedSettings.sendMethod != SEND_METHOD.ENTER && parsedSettings.sendMethod != SEND_METHOD.CTRL_ENTER) {
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

        const unsub = showQuickSettingsPanel.subscribe((value) => {
            if (value) {
                loadChatSettings();
            }
        });

        const click = (e: Event) => {
            const target = e.target as HTMLElement;
            if (target === node) {
                showQuickSettingsPanel.set(false);
            } else if (target.id) {
                if (target.id == "buttonSound") {
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
                } else if (target.id == "chooseQuickEmojiButton") {
                    //!TODO: Add quick emoji picker
                }
            }
        };

        
        node.onclick = click;
        
        return {
            destroy() {
                node.onclick = null;
                unsub();
            },
        };
    }

</script>

{#if $showQuickSettingsPanel}
    <div
        class="quickSettingsPanelWrapper"
        transition:fly={{ y: 30, duration: 100 }}
        use:handleClick
    >
        <div class="utils">
            <div class="title" transition:fly|global={{y: 20, delay: 0}}>
                Settings <i class="fa-solid fa-gear" />
                <span class="moreInfo">[Alt+s]</span>
            </div>
            <div class="subsettingsContainer">
                <div class="subsettings">
                    <div class="subtitle"  transition:fly|global={{y: 20, delay: 10}}>
                        Sounds <i class="fa-solid fa-volume-high" />
                    </div>
                    <!-- Enable/disable button sounds -->
                    <div class="field-checkers btn play-sound hoverShadow"  transition:fly|global={{y: 20, delay: 20}}>
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
                    <div class="field-checkers btn play-sound hoverShadow"  transition:fly|global={{y: 20, delay: 30}}>
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

                <div class="subsettings">
                    <div class="subtitle"  transition:fly|global={{y: 20, delay: 40}}>
                        Keyboard <i class="fa-regular fa-keyboard" />
                    </div>
                    <div
                        class="field-checkers keyboardMode btn play-sound hoverShadow"
                        transition:fly|global={{y: 20, delay: 50}}
                        >
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
                                <div class="moreInfo">
                                    Enter to add newlines
                                </div>
                            </div>
                            <span class="toggleButton" />
                        </label>
                    </div>

                    <div
                        class="field-checkers keyboardMode btn play-sound hoverShadow"
                        transition:fly|global={{y: 20, delay: 60}}
                    >
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
                <div class="subsettings">
                    <div class="subtitle"  transition:fly|global={{y: 20, delay: 70}}>
                        Quick emoji <i class="fa-regular fa-smile" />
                    </div>
                    <div class="field-checkers btn play-sound hoverShadow"  transition:fly|global={{y: 20, delay: 80}}>
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
                    <div class="field-checkers btn play-sound hoverShadow"  transition:fly|global={{y: 20, delay: 90}}>
                        <button class="hyper" id="chooseQuickEmojiButton"
                            >Change Emoji <span class="quickEmojiIcon">{themesMap[$currentTheme]['emoji']}</span
                            ></button
                        >
                    </div>
                </div>

                <button  transition:fly|global={{x: -10, delay: 100}}
                    id="themeButton"
                    on:click={() => {
                        showThemesPanel.set(true);
                    }}
                    class="button btn play-sound hover"
                    title="Select themes [Alt+t]"
                    ><i class="fa-solid fa-palette" /><span>Theme</span><i
                        class="fa-solid fa-brush"
                    />
                </button>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
    input {
        display: none;
    }

    .quickSettingsPanelWrapper {
        position: fixed;
        height: 100%;
        width: 100%;
        top: 0;
        left: 0;
        z-index: 50;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        transition: 0.1s ease-in-out;

        .moreInfo {
            color: grey !important;
            font-size: 0.7rem;
        }

        .field-checkers {
            display: flex;
            position: relative;
            cursor: pointer;
            user-select: none;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 5px;
            padding: 10px;
            padding: 5px 10px;
            width: 100%;
            border-radius: 10px;

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
                    font-size: 0.9rem;
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

            #chooseQuickEmojiButton {
                color: var(--secondary-dark);
                background: transparent;
                border: none;
                padding: 5px;
                cursor: pointer;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: 100ms ease-in-out;
                .quickEmojiIcon {
                    font-size: 1.5rem;
                }
            }
        }

        #themeButton {
            background: var(--secondary-dark);
            margin-top: 10px;
        }
    }

    .utils {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        gap: 10px;
        background: var(--primary-dark);
        padding: 15px;
        border-radius: 10px;
        filter: drop-shadow(2px 4px 6px #000);
        font-size: 0.8rem;
        width: min(80vw, 315px);
        max-height: 90vh;
        transition: 0.1s ease-in-out;

        .title {
            width: 100%;
            padding: 0 0 5px;
            margin-bottom: 10px;
            border-bottom: 2px solid var(--option-color);
            color: white;
            font-size: 1rem;
        }

        .subsettingsContainer {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: center;
            gap: 10px;
            width: 100%;
            overflow-y: scroll;
            .subsettings {
                width: 100%;
                .subtitle {
                    font-size: 1rem;
                    color: var(--secondary-dark);
                    padding-bottom: 5px;
                }
            }
        }
    }
</style>
