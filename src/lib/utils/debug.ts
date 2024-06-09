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