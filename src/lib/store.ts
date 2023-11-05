import { writable, type Writable } from "svelte/store";

export const showUserInputForm = writable(false);
export const formNotification = writable('');


export const reconnectButtonEnabled = writable(false);
export const formActionButtonDisabled = writable(true);

export const clientOnline = writable(false);

//array of strings
export const usedUsernames: Writable<string[]> = writable([]);
export const usedAvatars: Writable<string[]> = writable([]);


export type User = {
    id: string,
    name: string,
    avatar: string,
}

type chatRoomStoreType = {
    Key: string,
    userList: Map<string, User>,
    maxUsers: number,
};

export const selfInfoStore: Writable<User> = writable({
    id: '',
    name: '',
    avatar: '',
});

export const chatRoomStore: Writable<chatRoomStoreType> = writable({
    Key: '',
    userList: new Map(),
    maxUsers: 0,
});

export const authSocketConnected = writable(false);

export const isConnected = writable(false);