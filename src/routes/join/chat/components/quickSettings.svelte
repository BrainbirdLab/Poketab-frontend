<div class="quickSettingsPanelWrapper">
    <div class="utils">
        <div class="title">
            Settings <i class="fa-solid fa-gear"></i> <span class="moreInfo">[Alt+s]</span>
        </div>
        <div class="subsettingsContainer">
            <div class="subsettings">
                <div class="subtitle">Sounds <i class="fa-solid fa-volume-high"></i></div>
                <!-- Enable/disable button sounds -->
                <div class="field-checkers btn play-sound">
                    <input type="checkbox" id="buttonSound">
                    <label for="buttonSound">
                        <div class="textContainer">
                            Click Sound
                        </div>
                        <span class="toggleButton"></span>
                    </label>
                </div>
                <!-- Enable/disable message sounds -->
                <div class="field-checkers btn play-sound">
                    <input type="checkbox" id="messageSound">
                    <label for="messageSound">
                        <div class="textContainer">
                            Message sound
                        </div>
                        <span class="toggleButton"></span>
                    </label>
                </div>
            </div>
    
            <div class="subsettings">
                <div class="subtitle">Keyboard <i class="fa-regular fa-keyboard"></i></div>
                <div class="field-checkers keyboardMode btn play-sound">
                    <input type="radio" name="sendMethod" id="Ctrl+Enter" value="Ctrl+Enter">
                    <label for="ctrl">
                        <div class="textContainer">
                            Use Ctrl+Enter to send
                            <div class="moreInfo">Enter to add newlines</div>
                        </div>
                        <span class="toggleButton"></span>
                    </label>
                </div>
    
                <div class="field-checkers keyboardMode btn play-sound">
                    <input type="radio" name="sendMethod" id="Enter" value="Enter">
                    <label for="nonctrl">
                        <div class="textContainer">
                            Use Enter to send
                            <div class="moreInfo">Shift+Enter to add newlines</div>
                        </div>
                        <span class="toggleButton"></span>
                    </label>
                </div>
            </div>

            <!--Quick emoji-->
            <div class="subsettings">
                <div class="subtitle">Quick emoji <i class="fa-regular fa-smile"></i></div>
                <div class="field-checkers btn play-sound">
                    <input type="checkbox" id="quickEmoji">
                    <label for="quickEmoji">
                        <div class="textContainer">
                            Enable quick emoji
                        </div>
                        <span class="toggleButton"></span>
                    </label>
                </div>
                <div class="field-checkers btn play-sound">
                    <button class="hyper" id="chooseQuickEmojiButton">Change Emoji <span class="quickEmojiIcon">😅</span></button>
                </div>
            </div>

            <div id="themeButton" class="button btn play-sound" title="Select themes [Alt+t]"><i class="fa-solid fa-palette"></i><span>Theme</span><i class="fa-solid fa-brush"></i></div>
        </div>
    </div>
</div>

<style lang="scss">
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
            
            &:hover {
                background: rgba(255, 255, 255, 0.0392156863);
            }

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