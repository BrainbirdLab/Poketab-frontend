import { get } from "svelte/store";
import { io, Socket } from "socket.io-client";

import { chatRoomStore, isConnected, selfInfoStore, showUserInputForm } from "$lib/store";


export let chatSocket: Socket;

isConnected.subscribe(value => {
    if (value) {
        showUserInputForm.set(false);
        console.log(get(chatRoomStore).Key);
        console.log(get(selfInfoStore).id);
        chatSocket = io(':7777/chat', {
            auth: {
                key: get(chatRoomStore).Key,
                uid: get(selfInfoStore).id, 
            }
        });

        chatSocket.on('connect', () => {
            console.log('%cConnected to chat server', 'color: dodgerblue');
            isConnected.set(true);
        });
        
        //on refused connection
        chatSocket.on('connect_error', (error: any) => {
            console.log('%cConnection refused by chat server', 'color: red');
            isConnected.set(false);
            showUserInputForm.set(false);
        });
        
        chatSocket.on('disconnect', () => {
            console.log('%cDisconnected from chat server', 'color: red');
        });
    } else {
        if (chatSocket){
            chatRoomStore.set({
                Key: '',
                userList: new Map(),
                maxUsers: 0,
            });
            selfInfoStore.set({
                id: '',
                name: '',
                avatar: '',
            });
            chatSocket.disconnect();
        }
    }
});