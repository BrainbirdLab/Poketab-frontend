import { writable, get, type Writable } from "svelte/store";
import { type ErrorLog, type chatRoomStoreType } from "$lib/types";
import { messageDatabase } from "$lib/messageTypes";

export const showUserInputForm = writable(true);
export const formNotification = writable('');
export const reconnectButtonEnabled = writable(false);
export const formActionButtonDisabled = writable(true);
export const splashMessage = writable('');
export const splashButtonText = writable('');

export const userTypingString = writable('');


export const joinError: Writable<ErrorLog> = writable({text: '', icon: ''});
export const joinKey: Writable<string> = writable('');


export const showScrollPopUp = writable(false);
export const listenScroll = writable(true);

export const messageContainer = writable<HTMLElement>();
export const messageScrolledPx = writable<number>(0);

export const deviceType: Writable<'desktop' | 'mobile'> = writable('desktop');

export const outgoingXHRs: Writable<
    Map<string, XMLHttpRequest>
> = writable(new Map());

export const incommingXHRs: Writable<
    Map<string, XMLHttpRequest>
> = writable(new Map());

export const reactArray: Writable<{
    reacts: readonly string[],
    last: string,
}> = writable({
    reacts: ['💙', '😆', '😠', '😢', '😮', '🙂'],
    last: '🌻'
});

export const myId: Writable<string> = writable('');
export const myPrivateKey: Writable<CryptoKey> = writable();

export const chatRoomStore: Writable<chatRoomStoreType> = writable({
    Key: '',
    admin: '',
    userList: {},
    maxUsers: 0,
});

export const joinedChat = writable(false);

export const currentPage = writable('form');

export const DEVMODE = writable(false);

export function isTaken(avatar: string){

    const obj = get(chatRoomStore).userList;

    for (const key in obj) {
        if (obj[key].avatar === avatar) {
            return true;
        }
    }

    return false;
}

export function resetChatRoomStore(msg: string) {
    showUserInputForm.set(true);
    splashMessage.set(msg);
    splashButtonText.set('Ok');
    myId.set('');
    joinedChat.set(false);
    messageDatabase.reset();
    chatRoomStore.set({
        Key: '',
        admin: '',
        userList: {},
        maxUsers: 0,
    });
}