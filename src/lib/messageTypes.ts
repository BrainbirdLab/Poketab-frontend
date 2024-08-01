import { get, writable, type Updater, type Writable, type Subscriber } from "svelte/store";
import { chatRoomStore, myId } from "./store";

export const lastMessageId = writable('');

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

class MessageDatabase{

    #messageDatabaseArray: Writable<Array<MessageObjType>>;
    #messageIndexMap: Map<string, number>;

    constructor() {
        this.#messageDatabaseArray = writable([]);
        this.#messageIndexMap = new Map();
    }

    add(message: MessageObjType) {
        //this.#messageDatabaseArray.push(message);
        
        this.#messageDatabaseArray.update(arr => {
            arr.push(message);
            this.#messageIndexMap.set(message.id, get(this.#messageDatabaseArray).length - 1);
            if (message instanceof MessageObj){
                message.classList = this.#makeClasslist(message);
            }
            return arr;
        });
    }


    getMessage(id: string) {
        //return this.#messageDatabaseArray[this.#messageIndexMap.get(id) as number];
        return get(this.#messageDatabaseArray)[this.#messageIndexMap.get(id) as number];
    }

    getMessageByIndex(index: number) {
        //return this.#messageDatabaseArray[index];
        return get(this.#messageDatabaseArray).at(index);
    }

    /**
     * Resets the message database
     */
    reset(){
        this.#messageDatabaseArray.set([]);
        this.#messageIndexMap.clear();
    }

    /**
     * 
     * @param id Message id
     * @returns Index of the message in dataArray
     */
    getIndex(id: string) {
        return this.#messageIndexMap.get(id) as number;
    }

    #makeClasslist(message: MessageObj){

        let classListString = ' end';
    
        if (message.sender === get(myId)){
            classListString += ' self';
        }
    
        if (get(this.#messageDatabaseArray).length > 0){
            
            const index = this.getIndex(message.id);

            let lastMessageObj = this.getMessageByIndex(index - 1);
    
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
    
        if (((get(chatRoomStore).maxUsers > 2 && !classListString.includes('self')) || message.replyTo) && classListString.includes('newGroup')){
            classListString += ' title';
        }
    
        return classListString;
    }

    /**
     * 
     * @param oldId Client generated temporary Message Id
     * @param newId Server generated id after delivering the message to the server for relaying
     * @returns void
     */
    markDelevered(message: MessageObj, newId: string) {

        this.#messageDatabaseArray.update((array) => {
            const index = this.getIndex(message.id);
            if (index && array[index] instanceof MessageObj){
                this.#messageIndexMap.delete(message.id);
                message.id = newId;
                message.sent = true;
                array[index] = message;
                this.#messageIndexMap.set(message.id, index);
            }
            return array;
        });
    }

    subscribe(fn: Subscriber<Array<MessageObj | ServerMessageObj | LocationMessageObj>>) {
        return this.#messageDatabaseArray.subscribe(fn);
    }

    //svelte store/update like
    update(fn: Updater<Array<MessageObj | ServerMessageObj | LocationMessageObj>>) {
        this.#messageDatabaseArray.update(fn);
    }

    has(id: string) {
        return this.#messageIndexMap.has(id);
    }

    get length(){
        //return this.#messageDatabaseArray.length;
        return get(this.#messageDatabaseArray).length;
    }
}


export const messageDatabase = new MessageDatabase();


export const eventTriggerMessageId = writable<string> ("");
export const replyTarget = writable<MessageObj | null> (null);
export const selectedFiles = writable<FileList>();
export const notice = writable<MessageObj | null>(null);