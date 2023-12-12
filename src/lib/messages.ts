import { writable } from "svelte/store";

export const lastMessageId = writable('');

export class ServerMessageObj {
    text: string;
    type: string;
    constructor() {
        this.text = '';
        this.type = '';
    }
}

export class LocationMessageObj {
    lat: number;
    lon: number;
    uid: string;
    constructor(lat: number, lon: number, uid: string) {
        this.lat = lat;
        this.lon = lon;
        this.uid = uid;
    }
}

export class MessageObj {
    id: string;
    message: string;
    classList: string;
    sent: boolean;
    type: string;
    kind: string;
    sender: string;
    replyTo: string;
    timeout: NodeJS.Timeout | undefined;
    seenBy: { [key: string]: boolean}
    reactedBy: { [key: string]: string}
    timeStamp: number;

    constructor() {
        this.id = '';
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
        this.kind = 'sticker';
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


export const messageDatabase = writable<Map<string, MessageObj | StickerMessageObj | FileMessageObj | AudioMessageObj | ServerMessageObj | LocationMessageObj>>(new Map<string, MessageObj>());

export const eventTriggerMessageId = writable<string>('');
export const replyTargetId = writable<string>('');