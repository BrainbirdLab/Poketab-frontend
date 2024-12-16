import { type ErrorLog, type chatRoomStoreType } from "$lib/types";
import { ref } from "$lib/ref.svelte";
import { messageDatabase } from "./messageStore.svelte";

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

export const outgoingXHRs = ref<Map<string, XMLHttpRequest>>(new Map());

export const incommingXHRs = ref<Map<string, XMLHttpRequest>>(new Map());

export const reactArray= ref<{
    reacts: readonly string[],
    last: string,
}>({
    reacts: ['💙', '😆', '😠', '😢', '😮', '🙂'],
    last: '🌻'
});

export const myId = ref('');
export const myPrivateKey = ref<CryptoKey>();

export const chatRoomStore = ref<chatRoomStoreType>({
    Key: '',
    admin: '',
    userList: {},
    maxUsers: 0,
});

export const joinedChat = ref(false);

export const currentPage = ref('form');

export const DEVMODE = ref(false);

export function isTaken(avatar: string){

    const obj = chatRoomStore.value.userList;

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
    chatRoomStore.value = {
        Key: '',
        admin: '',
        userList: {},
        maxUsers: 0,
    };
}