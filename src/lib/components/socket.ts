import { reconnectButtonEnabled, socketConnected, formNotification, formActionButtonDisabled, splashMessage, showUserInputForm, splashButtonText, myId, joinedChat, currentPage } from "$lib/store";
import { get, writable } from "svelte/store";
import { io } from "socket.io-client";
import { chatRoomStore, type User } from "$lib/store";
import { browser } from "$app/environment";
import { ServerMessageObj, messageDatabase } from "$lib/messageTypes";

//get server value from .env file
const server = import.meta.env.VITE_SOCKET_SERVER_URL;

export const socket = io(server);

export type socketResponse = {
    success: boolean,
    message: string,
    icon: string,
    statusCode: number,
    users: { [key: string]: User },
    maxUsers: number,
}

export function reConnectSocket() {
    console.log('%cReconnecting server', 'color: lime');
    retryCount.set(1);
    formNotification.set('Reconnecting...');
    reconnectButtonEnabled.set(false);
    socket.connect();
}

function resetChatRoomStore(msg: string) {
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

//if browser
if (browser) {
    socket.on('updateUserListWR', (users: { [key: string]: User }) => {
        //console.log('Updating user list - WR');

        const userlen = Object.keys(users).length;

        //console.log('User list length: ' + userlen);

        if (userlen < 1) {
            resetChatRoomStore('Chat no longer exists');
        } else if (userlen >= get(chatRoomStore).maxUsers) {
            resetChatRoomStore('Oops!! Chat is full');
        } else {
            formNotification.set('');
            chatRoomStore.update((chatRoom) => {
                chatRoom.userList = users;
                return chatRoom;
            });
        }
    });
}

socket.on('connect', () => {
    splashMessage.set('');
    formActionButtonDisabled.set(false);
    retryCount.set(1);
    socketConnected.set(true);
    console.log(socket.id);
    if (get(formNotification) == '') {
        console.log('%cConnected to server', 'color: blue');
        return;
    }
    formNotification.set('Connected to server');
    console.log('%cReconnected to server', 'color: lime');
    setTimeout(() => {
        formNotification.set('');
    }, 2000);
});

let retryCount = writable(1);

formNotification.subscribe(value => {
    if (value.includes('offline')) {
        retryCount.set(1);
        reconnectButtonEnabled.set(false);
    } else if (value.includes('Error: ')) {
        setTimeout(() => {
            formNotification.set('');
        }, 2000);
    }
});


socket.on('connect_error', (err) => {
    console.log('%cConnection error - Socket.ts', 'color: red');
    socketConnected.set(false);

    if (get(formNotification) == 'Disconnected from server') {
        formNotification.set('Reconnecting...');
    } else {
        if (get(retryCount) >= 3) {
            formNotification.set('Could not connect to server.');
            console.log('%cCould not connect to server', 'color: red');
            reconnectButtonEnabled.set(true);
            socket.disconnect();
            retryCount.set(1);
            return;
        }
        formNotification.set('Could not connect to server. Retrying... ' + get(retryCount) + '/3');
        retryCount.update(n => n + 1);
    }
});


socket.on('disconnect', () => {

    if (get(currentPage) === 'chat') {
        const message = new ServerMessageObj();
        message.text = 'Disconnected from server';
        message.id = crypto.randomUUID();
        message.type = 'warn';

        messageDatabase.add(message);
    } else {
        formNotification.set('Disconnected from server');
        socketConnected.set(false);
        formActionButtonDisabled.set(true);
        retryCount.set(1);
        console.log('%cDisconnected from server', 'color: red');
    }
});

socket.on('selfDestruct', (msg: string) => {
    resetChatRoomStore(msg);
});