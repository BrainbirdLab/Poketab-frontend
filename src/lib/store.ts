import { writable, get, type Writable } from "svelte/store";

export const showUserInputForm = writable(true);
export const formNotification = writable('');
export const splashMessage = writable('');

export const userTypingString = writable('');
export const currentTheme = writable('Ocean');


type ErrorLog = {
    text: string,
    icon: string,
};

export const joinError: Writable<ErrorLog> = writable({text: '', icon: ''});

export const joinKey: Writable<string> = writable('');

export enum SEND_METHOD {
    ENTER = "Enter",
    CTRL_ENTER = "Ctrl+Enter",
}

export const sendMethod: Writable<SEND_METHOD> = writable(SEND_METHOD.ENTER);
export const buttonSoundEnabled = writable(true);
export const messageSoundEnabled = writable(true);
export const quickEmojiEnabled = writable(true);
export const quickEmoji = writable('');


export const reconnectButtonEnabled = writable(false);
export const formActionButtonDisabled = writable(true);

export const showScrollPopUp = writable(false);
export const listenScroll = writable(true);

/*
export const reactArray = {
    reacts: ['💙', '😆', '😠', '😢', '😮', '🙂'] as readonly string[],
    last: '🌻'
};
*/


export const reactArray: Writable<{
    reacts: readonly string[],
    last: string,
}> = writable({
    reacts: ['💙', '😆', '😠', '😢', '😮', '🙂'],
    last: '🌻'
});

//export const clientOnline = writable(false);


export type User = {
    uid: string,
    name: string,
    avatar: string,
    lastSeenMessage?: string | null,
}

type chatRoomStoreType = {
    Key: string,
    userList: { readonly [key: string]: User},
    maxUsers: number,
};

export const myId: Writable<string> = writable('');

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