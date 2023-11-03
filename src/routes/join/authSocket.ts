import {io} from "socket.io-client";

export const authSocket = io(':7777/auth');

authSocket.on('connect', () => {
    console.log('%cConnected to auth server', 'color: orange');
});

authSocket.on('disconnect', () => {
    console.log('%cDisconnected from auth server', 'color: red');
});