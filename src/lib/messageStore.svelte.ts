import { chatRoomStore, myId } from "./store.svelte";
import { ref } from "./ref.svelte";
import { get, writable, type Subscriber, type Updater } from "svelte/store";

export class ServerMessageObj {
    id: string;
    text: string;
    type: 'join' | 'leave' | 'debug' | 'info';
    baseType: 'server';
    readonly timeStamp: number;
    constructor() {
        this.id = '';
        this.text = '';
        this.type = 'join';
        this.baseType = 'server';
        this.timeStamp = Date.now();
    }
}

export class LocationMessageObj {
    lat: number;
    lon: number;
    uid: string;
    id: string;
    baseType: 'location';
    readonly timeStamp: number;
    constructor(lat: number, lon: number, id: string, uid: string) {
        this.lat = lat;
        this.lon = lon;
        this.uid = uid;
        this.id = id;
        this.baseType = 'location';
        this.timeStamp = Date.now();
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
    smKey: CryptoKey | null;

    seenBy: Set<string> = new Set();
    reactedBy: Map<string, string> = new Map();

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
        this.seenBy = new Set();
        this.reactedBy = new Map();
        this.smKey = null;
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
    loaded: number;
    loadScheme?: 'upload' | 'download' | null;
    constructor() {
        super();
        this.url = '';
        this.name = '';
        this.baseType = 'file';
        this.size = 0;
        this.loaded = 0;
        this.loadScheme = null;
    }
}

export class ImageMessageObj extends FileMessageObj {
    width: number;
    height: number;
    thumbnail: string;
    constructor() {
        super();
        this.baseType = 'image';
        this.thumbnail = '';
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

type MessageObjType = MessageObj | ServerMessageObj | LocationMessageObj;

function MakeMessageDB() {

    let messageDatabaseArray = writable<MessageObjType[]>([]);
    let messageIndexMap: Map<string, number> = new Map();

    return {

        getMessage(id: string) {
            return get(messageDatabaseArray)[messageIndexMap.get(id) as number];
        },

        add(message: MessageObjType) {
            messageDatabaseArray.update(msgs => {
                msgs.push(message);
                messageIndexMap.set(message.id, msgs.length - 1);
                if (message instanceof MessageObj){
                    message.classList = makeClasslist(message);
                }
                return msgs;
            });
        },

        getMessageByIndex(index: number) {
            return get(messageDatabaseArray).at(index);
        },

        /**
         * Resets the message database
         */
        reset(){
            messageDatabaseArray.set([]);
            messageIndexMap.clear();
        },

        /**
         * 
         * @param id Message id
         * @returns Index of the message in dataArray
         */
        getIndex(id: string) {
            return messageIndexMap.get(id) as number;
        },

        /**
         * 
         * @param oldId Client generated temporary Message Id
         * @param newId Server generated id after delivering the message to the server for relaying
         * @returns void
         */
        markDelevered(message: MessageObj, newId: string) {

            messageDatabaseArray.update((array) => {
                const index = this.getIndex(message.id);
                if (index && array[index] instanceof MessageObj){
                    messageIndexMap.delete(message.id);
                    message.id = newId;
                    message.sent = true;
                    array[index] = message;
                    messageIndexMap.set(message.id, index);
                }
                return array;
            });
        },

        subscribe(fn: Subscriber<Array<MessageObj | ServerMessageObj | LocationMessageObj>>) {
            return messageDatabaseArray.subscribe(fn);
        },

        //svelte store/update like
        update(fn: Updater<Array<MessageObj | ServerMessageObj | LocationMessageObj>>) {
            messageDatabaseArray.update(fn);
        },

        has(id: string) {
            return messageIndexMap.has(id);
        },

        get length(){
            //return messageDatabaseArray.length;
            return get(messageDatabaseArray).length;
        },
    }
}

export const lastMessageId = ref('');
export const messageDatabase = MakeMessageDB();
export const eventTriggerMessageId = ref<string> ("");
export const replyTarget = ref<MessageObj | null> (null);
export const selectedFiles = ref<FileList>();
export const notice = ref<MessageObj | null>(null);

function makeClasslist(message: MessageObj){

    let classListString = ' end';

    if (message.sender === myId.value){
        classListString += ' self';
    }

    if (messageDatabase.length > 0) {
        
        const index = messageDatabase.getIndex(message.id);

        let lastMessageObj = messageDatabase.getMessageByIndex(index - 1);

        if (lastMessageObj instanceof MessageObj){

            if (message.replyTo){
                classListString += ' start newGroup';
            } else {
                if (message.baseType == 'sticker'){
                    classListString += ' start';
                }
        
                if (message.baseType != lastMessageObj.baseType || lastMessageObj.sender !== message.sender){
                    classListString += ' start newGroup';
                } else if (lastMessageObj.baseType === message.baseType){
                    //two messages of same kind
                    if ( (message.baseType === 'text' || message.baseType === 'file' || message.baseType === 'image' || message.baseType === 'audio') &&  message.type !== 'emoji' && lastMessageObj.type !== 'emoji'){
                        lastMessageObj.classList = lastMessageObj.classList.replace('end', '');
                    } else {
                        classListString += ' start';
                    }
                }
            }
        } else {
            classListString += ' start newGroup';
        }
    } else {
        classListString += ' start newGroup';
    }

    if (((chatRoomStore.value.maxUsers > 2 && !classListString.includes('self')) || message.replyTo) && classListString.includes('newGroup')){
        classListString += ' title';
    }

    return classListString;
}