import { SEND_METHOD } from "$lib/types";
import { DEFAULT_THEME, themes } from "./themesTypes";
import { deviceType } from "$lib/store.svelte";
import { ref } from "$lib/ref.svelte";

export const sendMethod = ref<SEND_METHOD>(SEND_METHOD.ENTER);
export const buttonSoundEnabled = ref(true);
export const messageSoundEnabled = ref(true);
export const quickEmojiEnabled = ref(true);
export const quickEmoji = ref('');
export const linkPreviewOn = ref(true);
export const DEFAULT_STICKER_GROUP = "catteftel";
export const selectedStickerGroup = ref(DEFAULT_STICKER_GROUP);
export const currentTheme = ref(DEFAULT_THEME);

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
        deviceType.value == "mobile"
            ? SEND_METHOD.CTRL_ENTER
            : SEND_METHOD.ENTER,
};

function setChatSettings(parsedSettings: Partial<Settings>) {
    buttonSoundEnabled.value = 
        parsedSettings.buttonSoundEnabled ??
            defaultSettings.buttonSoundEnabled;
    messageSoundEnabled.value = 
        parsedSettings.messageSoundEnabled ??
            defaultSettings.messageSoundEnabled;
    quickEmojiEnabled.value = 
        parsedSettings.quickEmojiEnabled ??
            defaultSettings.quickEmojiEnabled;
    quickEmoji.value = 
        parsedSettings.quickEmoji ?? themes[DEFAULT_THEME].quickEmoji;
    selectedStickerGroup.value = 
        parsedSettings.selectedStickersGroup ?? DEFAULT_STICKER_GROUP;
    currentTheme.value = parsedSettings.currentTheme ?? DEFAULT_THEME;
    sendMethod.value = parsedSettings.sendMethod ?? defaultSettings.sendMethod;
    linkPreviewOn.value = parsedSettings.linkPreviewOn ?? defaultSettings.linkPreviewOn;
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