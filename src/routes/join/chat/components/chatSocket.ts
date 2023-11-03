import { Socket, io } from 'socket.io-client';
import { get } from 'svelte/store';
import { chatRoomStore, selfInfoStore, isConnected, showUserInputForm, type UserInfo } from '$lib/store';

export let chatSocket: Socket;

isConnected.subscribe(value => {
    if (value) {
        //showUserInputForm.set(false);
        chatSocket = io(':7777/chat', {
            auth: {
                key: get(chatRoomStore).key,
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
            chatSocket.disconnect();
        }
    }
});

