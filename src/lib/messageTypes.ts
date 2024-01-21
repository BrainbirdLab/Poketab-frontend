import { writable, type Writable } from "svelte/store";

export const lastMessageId = writable('');

export class ServerMessageObj {
    text: string;
    type: string;
    baseType: 'server';
    constructor() {
        this.text = '';
        this.type = '';
        this.baseType = 'server';
    }
}

export class LocationMessageObj {
    lat: number;
    lon: number;
    uid: string;
    baseType: 'location';
    constructor(lat: number, lon: number, uid: string) {
        this.lat = lat;
        this.lon = lon;
        this.uid = uid;
        this.baseType = 'location';
    }
}

export class MessageObj {
    id: string;
    classList: string;
    sent: boolean;
    type: string;
    baseType: string;
    sender: string;
    replyTo: string;
    timeout: number | undefined;
    seenBy: { [key: string]: boolean}
    reactedBy: { [key: string]: string}
    readonly timeStamp: number;

    constructor() {
        this.id = '';
        this.classList = '';
        this.sent = false;
        this.type = '';
        this.baseType = '';
        this.sender = '';
        this.replyTo = '';
        this.timeStamp = Date.now();
        this.timeout = undefined;
        this.seenBy = {};
        this.reactedBy = {};
    }
}


export type linkPreviewType = {
    title: string,
    description: string,
    image: string,
    url: string,
}

export class TextMessageObj extends MessageObj {
    
    message: string;

    type: 'text' | 'emoji' | 'deleted';

    baseType: 'text';
    
    linkPreviewData?: linkPreviewType | null;
    
    constructor() {
        super();
        this.type = 'text';
        this.baseType = 'text';
        this.message = '';
        this.linkPreviewData = null;
    }
}

export class StickerMessageObj extends MessageObj {
    src: string;
    type: 'sticker';
    baseType: 'sticker';
    groupName: string;
    number: number;
    constructor() {
        super();
        this.type = 'sticker';
        this.baseType = 'sticker';
        this.src = '';
        this.groupName = '';
        this.number = 0;
    }
}

export class FileMessageObj extends MessageObj {
    url: string;
    name: string;
    size: number;
    baseType: 'file' | 'image' | 'audio';
    loaded: boolean;
    constructor() {
        super();
        this.url = '';
        this.name = '';
        this.baseType = 'file';
        this.size = 0;
        this.loaded = false;
    }
}

export class ImageMessageObj extends FileMessageObj {
    width: number;
    height: number;
    constructor() {
        super();
        this.baseType = 'image';
        this.width = 0;
        this.height = 0;
    }
}

export class AudioMessageObj extends FileMessageObj {

    audio: HTMLAudioElement;
    duration: number;

    constructor() {
        super();
        this.baseType = 'audio';
        this.audio = new Audio();
        this.duration = 0;
    }
}

export const messageDatabase: Writable<Map<string, MessageObj | ServerMessageObj | LocationMessageObj>> = writable(new Map());

export const eventTriggerMessageId = writable<string>('');
export const replyTargetId = writable<string>('');
export const selectedFiles = writable<FileList>();
export const currentPlayingAudioMessage = writable<AudioMessageObj | null>(null);
export const voiceMessageAudio = writable<HTMLAudioElement | null>(null);

export const messageScrolledPx = writable<number>(0);
export const messageContainer = writable<HTMLElement>();
export const notice = writable<MessageObj | null>(null);