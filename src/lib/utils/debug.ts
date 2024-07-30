import { playMessageSound } from "$lib/utils";
import { ServerMessageObj, messageDatabase } from "../messageTypes";

let start = 0;

function getRandID(): string {
    start += 1;
    return start.toString().padStart(4, '0');
}

export function debugPrint(msg: string) {

    const msgObj = new ServerMessageObj();

    msgObj.id = 'debug-' + getRandID();
    msgObj.text = '#' + msgObj.id + ': ' + msg;
    msgObj.type = 'debug';
    msgObj.baseType = 'server';

    messageDatabase.add(msgObj);
}

export function infoMessage(msg: string, type: 'join' | 'leave' | 'info') {
    const msgObj = new ServerMessageObj();
    msgObj.id = 'info-' + getRandID();
    msgObj.text = msg;
    msgObj.type = type;
    msgObj.baseType = 'server';

    messageDatabase.add(msgObj);

    if (type == "join") {
        playMessageSound("join");
    } else if (type == "leave") {
        playMessageSound("leave");
    }
}