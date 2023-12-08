import { writable } from "svelte/store";

export const lastSeenMessage = writable('');

export class ServerMessageObj {
    text: string;
    type: string;
    constructor() {
        this.text = '';
        this.type = '';
    }
}

export class MessageObj {
    message: string;
    classList: string;
    sent: boolean;
    type: string;
    kind: string;
    sender: string;
    replyTo: string;
    timeout: number | undefined;
    seenBy: { [key: string]: boolean}
    reactedBy: { [key: string]: string}
    timeStamp: number;

    constructor() {
        this.message = '';
        this.classList = '';
        this.sent = false;
        this.type = '';
        this.kind = '';
        this.sender = '';
        this.replyTo = '';
        this.timeStamp = Date.now();
        this.timeout = undefined;
        this.seenBy = {};
        this.reactedBy = {};
    }
}

export class StickerMessageObj extends MessageObj {
    src: string;
    groupName: string;
    number: number;
    constructor() {
        super();
        this.type = 'sticker';
        this.kind = 'file';
        this.src = '';
        this.groupName = '';
        this.number = 0;
    }
}

export class FileMessageObj extends MessageObj {
    src: string;
    name: string;
    size: number;
    loaded: boolean;
    downloadLink: string;
    constructor() {
        super();
        this.src = '';
        this.name = '';
        this.size = 0;
        this.loaded = false;
        this.downloadLink = '';
    }
}

export class AudioMessageObj extends FileMessageObj {
    duration: number;
    constructor() {
        super();
        this.type = 'audio';
        this.kind = 'file';
        this.duration = 0.0;
    }
}


export const messageDatabase = writable<Map<string, MessageObj | StickerMessageObj | FileMessageObj | AudioMessageObj | ServerMessageObj>>(new Map<string, MessageObj>());

export const targetMessage = writable<string>('');