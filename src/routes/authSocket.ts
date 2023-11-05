import { reconnectButtonEnabled, authSocketConnected, formNotification, formActionButtonDisabled } from "$lib/store";
import { get } from "svelte/store";
import {io} from "socket.io-client";

export const authSocket = io(':7777/auth');

export function reConnectAuthSocket(){
    console.log('%cReconnecting to auth server', 'color: lime');
    retry = 1;
    formNotification.set('Reconnecting...');
    reconnectButtonEnabled.set(false);
    authSocket.connect();
}

authSocket.on('connect', () => {
    console.log('%cConnected to auth server', 'color: blue');
    formActionButtonDisabled.set(false);
    retry = 1;
    authSocketConnected.set(true);
    if (get(formNotification) == ''){
        return;
    }
    formNotification.set('Connected to server');
    console.log('%cReconnected to server', 'color: lime');
    setTimeout(() => {
        formNotification.set('');
    }, 2000);
});

let retry = 1;

authSocket.on('connect_error', (err) => {
    console.log('%cConnection error - authSocket.ts', 'color: red');
    authSocketConnected.set(false);
    if (get(formNotification) == 'Disconnected from server'){
        formNotification.set('Reconnecting...');
    } else {
        if(retry >= 3){
            formNotification.set('Could not connect to authentication server.');
            console.log('%cCould not connect to authentication server', 'color: red');
            reconnectButtonEnabled.set(true);
            authSocket.disconnect();
            retry = 1;
            return;
        }
        formNotification.set('Could not connect to server. Retrying... ' + retry++ + '/3');
    }
});


authSocket.on('disconnect', () => {
    formNotification.set('Disconnected from server');
    authSocketConnected.set(false);
    formActionButtonDisabled.set(true);
    retry = 1;
    console.log('%cDisconnected from auth server', 'color: red');
});