import { writable, get, type Writable } from "svelte/store";

export const showUserInputForm = writable(true);
export const formNotification = writable('');
export const splashMessage = writable('');

export const userTypingString = writable('');

export const currentTheme = writable('');

export enum SEND_METHOD {
    ENTER = "Enter",
    CTRL_ENTER = "Ctrl+Enter",
}

export type Settings = {
    buttonSoundEnabled: boolean;
    messageSoundEnabled: boolean;
    quickEmojiEnabled: boolean;
    sendMethod: SEND_METHOD;
};

export const defaultSettings = {
    buttonSoundEnabled: true,
    messageSoundEnabled: true,
    quickEmojiEnabled: true,
    sendMethod: SEND_METHOD.ENTER,
};

export const sendMethod: Writable<SEND_METHOD> = writable(SEND_METHOD.ENTER);
export const buttonSoundEnabled = writable(true);
export const messageSoundEnabled = writable(true);
export const quickEmojiEnabled = writable(true);
export const quickEmoji = writable('');

function setDefaultChatSettings(){
    sendMethod.set(defaultSettings.sendMethod);
    buttonSoundEnabled.set(defaultSettings.buttonSoundEnabled);
    messageSoundEnabled.set(defaultSettings.messageSoundEnabled);
    quickEmojiEnabled.set(defaultSettings.quickEmojiEnabled);
}

export function loadSettings() {
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
        console.error("Error parsing settings:", error);
        // Store the default settings
        localStorage.setItem("settings", JSON.stringify(defaultSettings));
        console.log("Default settings stored");
        // Update the settings to the default settings
        setDefaultChatSettings();
    }
}

export const reconnectButtonEnabled = writable(false);
export const formActionButtonDisabled = writable(true);

//export const clientOnline = writable(false);


export type User = {
    uid: string,
    name: string,
    avatar: string,
    lastSeenMessage: string,
}

type chatRoomStoreType = {
    Key: string,
    userList: {[key: string]: User},
    maxUsers: number,
};

export const selfInfoStore: Writable<User> = writable({
    uid: '',
    name: '',
    avatar: '',
    lastSeenMessage: '',
});

export const chatRoomStore: Writable<chatRoomStoreType> = writable({
    Key: '',
    userList: {},
    maxUsers: 0,
});

export const socketConnected = writable(false);

export const joinedChat = writable(false);

export const currentPage = writable('form');


export function isTaken(type: 'name' | 'avatar', query: string){
    let i = 0;
    const obj = get(chatRoomStore).userList;
    for (const key in obj) {
        //console.log(i++);
        if (obj.hasOwnProperty(key)) {
            const element = obj[key];
            //console.log(key, element);
            if (element[type] == query) {
                return true;
            }
        }
    }
    return false;
}