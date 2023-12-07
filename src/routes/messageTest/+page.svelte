<script lang="ts">

    export class MessageObj {
        message: string;
        classList: string;
        sent: boolean;
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
            this.sent = false;
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

    class AudioMessageObj extends FileMessageObj {
        duration: number;
        constructor() {
            super();
            this.type = 'audio';
            this.kind = 'file';
            this.duration = 0.0;
        }
    }

    type User = {
        uid: string,
        name: string,
        avatar: string,
    }

    type chatRoomStoreType = {
        Key: string,
        userList: {[key: string]: User},
        maxUsers: number,
    };

    const chatRoomStore: chatRoomStoreType = {
        Key: '8088494993',
        userList: {
            '1234': {
                uid: '1234',
                name: 'Fuad',
                avatar: 'pikachu',
            },
            '1235': {
                uid: '1235',
                name: 'Kira',
                avatar: 'squirtle',
            },
            '1236': {
                uid: '1236',
                name: 'L',
                avatar: 'charmander',
            },
            '1237': {
                uid: '1237',
                name: 'Light',
                avatar: 'bullbasaur',
            },
        },
        maxUsers: 0,
    };

    const selfInfoStore = {
        uid: '1234',
        name: 'Fuad',
        avatar: 'pikachu',
    };


    const messageDatabase: {[key: string]: MessageObj} = {

    };


    const messageIdArray: string[] = [];

    messageDatabase['1234'] = {
        message: 'Hello! Message from Fuad',
        classList: 'title self start',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1234',
        replyTo: '',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: new Map<string, string>(),
        timeStamp: Date.now(),
    }

    messageIdArray.push('1234');

    messageDatabase['1235'] = {
        message: '2nd message from Fuad',
        classList: 'self',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1234',
        replyTo: '',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: new Map<string, string>(),
        timeStamp: Date.now(),
    }

    messageIdArray.push('1235');

    let reacts = new Map<string, string>();
    reacts.set('1234', '🥺');
    reacts.set('1235', '😊');

    messageDatabase['1236'] = {
        message: '3rd message from Fuad',
        classList: 'self end',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1234',
        replyTo: '',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: reacts,
        timeStamp: Date.now(),
    }

    messageIdArray.push('1236');

    messageDatabase['1237'] = {
        message: 'Hello From L',
        classList: 'title start end',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1236',
        replyTo: '',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: new Map<string, string>(),
        timeStamp: Date.now(),
    }

    messageIdArray.push('1237');

    let reacts2 = new Map<string, string>();
    reacts2.set('1234', '🥺');

    messageDatabase['1238'] = {
        message: 'Hello From Light',
        classList: 'start title',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1237',
        replyTo: '1234',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: reacts2,
        timeStamp: Date.now(),
    }

    messageIdArray.push('1238');

    messageDatabase['1239'] = {
        message: 'What is up?',
        classList: 'end',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1237',
        replyTo: '',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: new Map<string, string>(),
        timeStamp: Date.now(),
    }

    messageIdArray.push('1239');

    messageDatabase['1240'] = {
        message: 'Im good',
        classList: 'title self start end',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1234',
        replyTo: '1239',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: new Map<string, string>(),
        timeStamp: Date.now(),
    }

    messageIdArray.push('1240');

    messageDatabase['1241'] = {
        message: '😊',
        classList: 'title start emoji',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1235',
        replyTo: '',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: new Map<string, string>(),
        timeStamp: Date.now(),
    }

    messageIdArray.push('1241');

    messageDatabase['1242'] = {
        message: '😭',
        classList: 'end emoji',
        sent: true,
        type: 'text',
        kind: 'text',
        sender: '1235',
        replyTo: '',
        timeout: undefined,
        seenBy: new Set<string>(),
        reacts: new Map<string, string>(),
        timeStamp: Date.now(),
    }

</script>


<div class="messages">
    {#each Object.entries(messageDatabase) as [id, message]}
    <li class="message msg-item {message.classList}" id="{id}"> <!-- noreply notitle delevered start end self react -->
        <div class="seenBy"></div>
        <div class="messageContainer">
            <div class="replyIcon">
                <i class="fa-solid fa-reply"></i>
            </div>
            {#if !message.sent}
            <div class="sent"><i class="fa-regular fa-paper-plane"></i></div>
            {/if}
            {#if message.sender != selfInfoStore.uid}
            <div class="avatar"><img src="/images/avatars/{(chatRoomStore.userList[message.sender]?.avatar)}(custom).webp" width="30px" height="30px" alt="avatar"></div>
            {/if}
            <div class="messageBody">
                {#if message.classList.includes('title')}
                <div class="messageTitle">
                    {#if message.replyTo}
                        {#if message.sender == selfInfoStore.uid}
                        You replied to {chatRoomStore.userList[messageDatabase[message.replyTo].sender].name}
                        {:else}
                        {chatRoomStore.userList[message.sender]?.name} replied to {chatRoomStore.userList[messageDatabase[message.replyTo].sender].uid == selfInfoStore.uid ? ' you' : chatRoomStore.userList[messageDatabase[message.replyTo].sender].name}
                        {/if}
                    {:else}
                        {#if message.sender == selfInfoStore.uid}
                        You
                        {:else}
                        {chatRoomStore.userList[message.sender]?.name}
                        {/if}
                    {/if}
                </div>
                {/if}
                {#if message.replyTo}
                <div class="messageReply">
                    {messageDatabase[message.replyTo].message}
                </div>
                {/if}
                <div class="messageMain">
                    <div class="msg text"><span class="data text-content">{message.message}</span></div>
                    <div class="messageTime">Just Now</div>
                </div>
                {#if message.reacts.size > 0}
                <div class="reactsContainer">
                    <div class="reacts">
                        <!-- Show all react emojis -->
                        {#each message.reacts as [uid, react]}
                        {react}
                        {/each}
                    </div>
                    {#if message.reacts.size > 1}
                    <div class="count">
                        <!-- Show number of reacts -->
                        {message.reacts.size}
                    </div>
                    {/if}
                </div>
                {/if}
            </div>
        </div>
    </li>
    {/each}
</div>


<style lang="scss">

    .reactsContainer{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        background: var(--option-color);
        border-radius: 18px;
        width: max-content;
        margin-top: -5px;
        z-index: 1;
        cursor: pointer;
        &:hover{
            filter: brightness(0.95);
        }
        .count{
            padding: 0 5px;
            font-size: 0.8rem;
        }
        .reacts{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            font-size: 0.8rem;
        }
    }

    .messages{
        display: flex;
        flex-direction: column;
        gap: 2px;
        width: 100%;
    }


    .message{
        display: flex;
        flex-direction: row-reverse;
        align-items: flex-end;
        position: relative;
        padding: 0 18px 0 5px;

        .messageContainer{
            display: flex;
            flex-direction: row;
            list-style: none;
            align-items: flex-end;
            gap: 3px;
            font-size: 0.8rem;
            width: 100%;
            position: relative;
            .replyIcon {
                display: flex;
                justify-content: center;
                align-items: center;
                align-content: center;
                flex-direction: column;
                background: var(--glass);
                border-radius: 50%;
                position: absolute;
                left: 0;
                transform: translateX(-40px);
                visibility: hidden;
                opacity: 0;
            }
        }

        .sent{
            i{
                font-size: 0.5rem !important;
                padding: 0;
                color: var(--foreground-dark);
            }
        }
        .avatar{
            height: 30px;
            width: 30px;
            border-radius: 50%;
            background: #dadada00;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .messageBody{
            position: relative;
            background: #00000000;
            max-width: 100%;
            display: flex;
            flex-direction: column;
            overflow-wrap: anywhere;
            .messageTitle{
                color: var(--secondary-dark);
                padding: 3px;
                display: flex;
                flex-direction: row;
                align-items: baseline;
                gap: 5px;
            }
            .messageReply{
                background: var(--msg-get-reply);
                color: hsla(0,0%,100%,.5);
                border-radius: 18px 18px 18px 8px;
                width: max-content;
                max-width: 250px;
                white-space: pre;
                overflow: hidden;
                display: inline-block;
                text-overflow: ellipsis;
                cursor: pointer;
                z-index: 0;
                padding: 8px 8px 25px 8px;
                i {
                    padding: 2px 0 0 0;
                    color: #ffffff60;
                    font-size: 1rem !important;
                }

                &.imageReply{
                    padding: 0;
                    filter: brightness(0.4) !important;
                    background: rgba(255,255,255,.09)!important;
                    position: relative;
                    img{
                        max-height: 200px;
                        max-width: 200px;
                        object-fit: cover;
                    }
                    img.sticker{
                        height: 100px;
                        width: 100px;
                    }
                }
            }
        }

        .messageTime{
            color: gray;
            font-size: 0.6rem;
            padding: 0 0 0 15px;
            visibility: hidden;
            opacity: 0;
            transition: 200ms ease-in-out;
            white-space: nowrap;
            display: flex;
            flex-direction: row;
            align-items: flex-end;
            justify-content: flex-start;
            width: 58px;
            min-width: 58px;
            &.active{
                visibility: visible;
                opacity: 1;
            }
        }
        
        &:last-child .messageTime{
            visibility: visible;
            opacity: 1;
        }
    }

    .start .avatar{
        visibility: hidden;
    }

    .message.emoji{
        .messageMain{
            .msg{
                background: none;
                border-radius: 18px;
                padding: 0 !important;
                .data{
                    padding: 0 !important;
                    font-size: 2rem !important;
                    width: min-content;
                }
            }
        }
    }

    //if previous message has react

    .message:has(.reactsContainer){
        .messageMain{
            .msg{
                border-bottom-right-radius: 18px;
                border-bottom-left-radius: 18px;
            }
        }
    }

    .message:has(.reactsContainer) + .message{
        .msg{
            //background: red;
            border-top-left-radius: 18px;
            border-top-right-radius: 18px;
        }
    }


    //! Classlist based modifications
    .message.start{
        padding-top: 20px;
        .messageMain{
            & > *{
                border-bottom-left-radius: 5px;
                border-top-left-radius: 18px;
            }
        }
    }

    .message.end{
        .messageMain{
            & > *{
                border-bottom-left-radius: 18px;
            }
        }
        .avatar{
            visibility: visible;
        }
    }

    .message.reply .messageTitle::before {
        content: '\f3e5';
        font-family: 'FontAwesome';
        font-size: 1rem;
    }

    .message.self{
        .messageContainer{
            flex-direction: row-reverse;
        }
        .sent{
            display: block;
        }
        .messageTime{
            justify-content: flex-end;
            padding: 0 15px 0 0;
        }
        .replyIcon{
            right: 0;
            left: unset;
            transform: translateX(50px);
        }
        .messageBody{
            align-items: flex-end;
            .messageReply{
                background: var(--msg-send-reply);
                border-radius: 18px 18px 8px 18px;
                .image{
                    border-radius: 18px 18px 8px 18px;
                }
                &.imageReply{
                    border-radius: 18px 18px 8px 18px !important;
                }
            }
            .messageMain{
                flex-direction: row-reverse;
                .text{
                    background: var(--msg-send);
                }
                .audioMessage{
                    background: var(--msg-send);
                }
                .file{
                    background: var(--msg-send)
                }
                & > *{
                    border-radius: 18px 5px 5px 18px;
                }
            }
        }
        &.start{
            .messageMain{
                & > *{
                    border-bottom-right-radius: 5px;
                    border-top-right-radius: 18px;
                }
            }
            .messageTitle{
                display: flex;
            }
        }
        &.end{
            .messageMain{
                & > *{
                    border-bottom-right-radius: 18px;
                }
            }
            .avatar{
                visibility: visible;
            }
        }
    }


    //!Main Message Element
    .messageMain{
        display: flex;
        color: white;
        position: relative;
        flex-direction: row;

        & > * {
            border-radius: 5px 18px 18px 5px;
        }

        &:hover{
            cursor: pointer;
        }
        .msg{
            transition: 100ms ease-in-out;
            border-top-right-radius: 18px;
            border-bottom-right-radius: 18px;
            .data{
                border-radius: inherit;
            }
            &.text{
                background: var(--msg-get);
                min-width: 32px;
                max-width: 75%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
                white-space: pre-wrap;

                .data.text-content{
                    padding: 8px;
                    font-size: 0.8rem;
                }
            }
            &.sticker {
                width: 100px;
                height: 100px;
                background: #ffffff17;
                border-radius: 18px;
                display: block;
                .image{
                    border-radius: inherit;
                    height: 100%;
                    width: 100%;
                }
            }
        }
    }

    .messageReply + .messageMain{
        margin-top: -20px;
    }


</style>