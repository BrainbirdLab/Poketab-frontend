import { io, Socket } from "socket.io-client";
import { get } from "svelte/store";
import { chatRoomStore, isConnected, selfInfoStore, showUserInputForm, type UserInfo } from "$lib/store";
import { messageDatabase, type MessageObj } from "./UI/components/messages";

let chatSocket: Socket | null = null; 

export function initChatSocket(){

  if (chatSocket === null){
    console.log('Initializing chat socket with auth token');
    console.log(get(chatRoomStore).key);
    console.log(get(selfInfoStore).id);
    chatSocket = io(':7777/chat', {
      auth: {
          key: get(chatRoomStore).key,
          uid: get(selfInfoStore).id, 
      }
    });
  }
  
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
  
  chatSocket.on('updateUserList', (userList: UserInfo[]) => {
    console.log('User list updated');
    console.log(userList);
    chatRoomStore.update(room => {
        room.userList = new Map();
        userList.forEach(user => {
        room.userList.set(user.id, user);
        });
        return room;
    });
  });

  return chatSocket;
}