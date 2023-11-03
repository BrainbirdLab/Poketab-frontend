import { writable } from "svelte/store";

export class MessageObj {
    message: string;
    classList: string;
    type: string;
    kind: string;
    sender: string;
    replyTo: string;
    timeout: number | undefined;
    seenBy: Set<string>;
    reacts: Map<string, string>;
    timeStamp: number;

    constructor() {
        this.message = '';
        this.classList = '';
        this.type = '';
        this.kind = '';
        this.sender = '';
        this.replyTo = '';
        this.timeStamp = Date.now();
        this.timeout = undefined;
        this.seenBy = new Set<string>();
        this.reacts = new Map<string, string>();
    }
}

export class TextMessageObj extends MessageObj {
    constructor(){
        super();
        this.type = 'text';
        this.kind = 'text';
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


export const messageDatabase = writable<Map<string, MessageObj>>(new Map<string, MessageObj>());