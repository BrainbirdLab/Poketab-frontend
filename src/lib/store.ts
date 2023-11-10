import { writable, get, type Writable } from "svelte/store";

export const showUserInputForm = writable(true);
export const formNotification = writable('');
export const splashMessage = writable('');


export const reconnectButtonEnabled = writable(false);
export const formActionButtonDisabled = writable(true);

//export const clientOnline = writable(false);


export type User = {
    uid: string,
    name: string,
    avatar: string,
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