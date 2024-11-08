import { reconnectButtonEnabled, formNotification, formActionButtonDisabled, resetChatRoomStore, currentPage, chatRoomStore } from "$lib/store.svelte";
import { get, writable } from "svelte/store";
import { type User } from "$lib/types";
import { browser } from "$app/environment";
import { io } from "socket.io-client";
import { PUBLIC_API_SERVER_URL } from "$env/static/public";

//get server value from .env file
export const API_URL = PUBLIC_API_SERVER_URL;

export const socket = io(API_URL);

/**
* Attempts to reconnect the WebSocket connection.
* Resets the retry count, sets a 'Reconnecting...' notification, disables the reconnect button, and calls `socket.connect()` to initiate the reconnection.
*/
export function reConnectSocket() {
    retryCount.set(1);
    formNotification.value = 'Reconnecting...';
    reconnectButtonEnabled.value = false;
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
            formNotification.value = '';
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

    if (formNotification.value == 'Disconnected from server') {
        formNotification.value = 'Connecting...';
    } else {
        if (get(retryCount) >= 3) {
            formNotification.value = 'Could not connect to server.';
            console.log('%cCould not connect to server', 'color: red');
            reconnectButtonEnabled.value = true;
            socket.disconnect();
            retryCount.set(1);
            return;
        }
        formNotification.value = 'Could not connect to server. Retrying... ' + get(retryCount) + '/3';
        retryCount.update(n => n + 1);
    }
    console.log('%cRetrying...', 'color: red');
});

socket.on('connect', () => {
    formActionButtonDisabled.value = false;
    retryCount.set(1);
    if (formNotification.value == '') {
        console.log('%cConnected to server', 'color: blue');
        return;
    }
    formNotification.value = 'Connected to server';
    console.log('%cReconnected to server', 'color: lime');
    setTimeout(() => {
        formNotification.value = '';
    }, 2000);
});

export const retryCount = writable(1);

formNotification.onChange((value) => {
    console.log('formNotification changed to ' + formNotification.value);
    if (value.includes('offline')) {
        retryCount.set(1);
        reconnectButtonEnabled.value = false;
    } else if (value.includes('Error: ')) {
        setTimeout(() => {
            formNotification.value = '';
        }, 2000);
    }
});


socket.on('disconnect', (_: string) => {
    console.log(_);
    retryCount.set(1);
    if (currentPage.value == 'chat') { // on the forms page
        resetChatRoomStore('Disconnected from server 🙃');
    }
    formNotification.value = '';
    formActionButtonDisabled.value = true;
    reconnectButtonEnabled.value = false;
    console.log('%cDisconnected from server', 'color: red');
});

socket.on('selfDestruct', (msg: string) => {
    socket.disconnect();
    resetChatRoomStore(msg);
});