import { writable, get, type Writable } from "svelte/store";
import { type ErrorLog, type chatRoomStoreType } from "$lib/types";
import { messageDatabase } from "$lib/messageTypes";
import { ref } from "$lib/ref.svelte";

export const showUserInputForm = ref(true);
export const formNotification = ref('');
export const reconnectButtonEnabled = ref(false);
export const formActionButtonDisabled = ref(true);
export const splashMessage = ref('');
export const splashButtonText = ref('');

export const joinError = ref<ErrorLog>({text: '', icon: ''});
export const joinKey = ref('');


export const showScrollPopUp = ref(false);
export const listenScroll = ref(true);

export const messageContainer = ref<HTMLElement>();
export const messageScrolledPx = ref<number>(0);

export const deviceType = ref<'desktop' | 'mobile'>('desktop');

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

export const myId = ref('');
export const myPrivateKey = ref<CryptoKey>();

export const chatRoomStore: Writable<chatRoomStoreType> = writable({
    Key: '',
    admin: '',
    userList: {},
    maxUsers: 0,
});

export const joinedChat = ref(false);

export const currentPage = ref('form');

export const DEVMODE = ref(false);

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
    showUserInputForm.value = true;
    splashMessage.value = msg;
    splashButtonText.value = 'Ok';
    myId.value = '';
    joinedChat.value = false;
    messageDatabase.reset();
    chatRoomStore.set({
        Key: '',
        admin: '',
        userList: {},
        maxUsers: 0,
    });
}