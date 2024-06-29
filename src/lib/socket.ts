import { reconnectButtonEnabled, formNotification, formActionButtonDisabled, resetChatRoomStore, currentPage, chatRoomStore } from "$lib/store";
import { get, writable } from "svelte/store";
import { io } from "socket.io-client";
import { type User } from "$lib/types";
import { browser } from "$app/environment";

import { PUBLIC_API_SERVER_URL } from "$env/static/public";

//get server value from .env file
export const API_URL = PUBLIC_API_SERVER_URL;

export const socket = io(API_URL);

export type socketResponse = {
    success: boolean,
    message: string,
    icon: string,
    statusCode: number,
    users: { [key: string]: User },
    maxUsers: number,
}

/**
* Attempts to reconnect the WebSocket connection.
* Resets the retry count, sets a 'Reconnecting...' notification, disables the reconnect button, and calls `socket.connect()` to initiate the reconnection.
*/
export function reConnectSocket() {
    retryCount.set(1);
    formNotification.set('Reconnecting...');
    reconnectButtonEnabled.set(false);
    socket.connect();
}

//if browser
if (browser) {
    socket.on('updateUserListWR', (users: { [key: string]: User }) => {

        const userlen = Object.keys(users).length;

        if (userlen < 1) {
            resetChatRoomStore('Chat no longer exists 😢');
        } else if (userlen >= get(chatRoomStore).maxUsers) {
            resetChatRoomStore('Oops!! Chat is full 😐');
        } else {
            formNotification.set('');
            chatRoomStore.update((chatRoom) => {
                chatRoom.userList = users;
                return chatRoom;
            });
        }
    });
}

socket.on('connect_error', (err) => {

    if (browser){
        if (!navigator.onLine) {
            return;
        }
    }

    console.log('%cConnection error - Socket.ts', 'color: red');

    if (get(formNotification) == 'Disconnected from server') {
        formNotification.set('Connecting...');
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
    console.log('%cRetrying...', 'color: red');
    //socket.connect();
});

socket.on('connect', () => {
    //splashMessage.set('');
    formActionButtonDisabled.set(false);
    retryCount.set(1);
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

export let retryCount = writable(1);

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


socket.on('disconnect', (_: string) => {
    console.log(_);
    retryCount.set(1);
    if (get(currentPage) == 'chat') { // on the forms page
        resetChatRoomStore('Disconnected from server 🙃');
    }
    formNotification.set('');
    formActionButtonDisabled.set(true);
    reconnectButtonEnabled.set(false);
    console.log('%cDisconnected from server', 'color: red');
});

socket.on('selfDestruct', (msg: string) => {
    socket.disconnect();
    resetChatRoomStore(msg);
});