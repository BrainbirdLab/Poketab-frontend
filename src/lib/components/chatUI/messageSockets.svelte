<script lang="ts">

    import { MessageObj, TextMessageObj, StickerMessageObj, LocationMessageObj, messageDatabase, lastMessageId, notice, ServerMessageObj, FileMessageObj, ImageMessageObj, AudioMessageObj } from "$lib/messageTypes";
    import { type User, chatRoomStore, userTypingString, myId, reactArray } from "$lib/store";
    import { filterBadWords } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import { socket } from "$lib/components/socket";
    import { emojis } from "$lib/utils";
    import { get } from "svelte/store";

    socket.on("newMessage", (message: MessageObj, messageId: string) => {
        //console.log(message);

        if(message.baseType == 'text' || message.baseType == 'deleted'){
            message = Object.setPrototypeOf(message, TextMessageObj.prototype);
        } else if (message.baseType == 'sticker'){
            message = Object.setPrototypeOf(message, StickerMessageObj.prototype);
        } else if (message.baseType == 'file'){
            //basetype is file but it can be 'file', 'image' or 'audio'
            message = Object.setPrototypeOf(message, FileMessageObj.prototype);
        } else if (message.baseType === 'image'){
            message = Object.setPrototypeOf(message, ImageMessageObj.prototype);
        } else if (message.baseType === 'audio'){
            message = Object.setPrototypeOf(message, AudioMessageObj.prototype);
        } else if (message.baseType == 'location'){
            message = Object.setPrototypeOf(message, LocationMessageObj.prototype);
        }


        //The message is recieved as Object, All properties of type Map, Set are lost as they become Object.
        //So we need to convert them back to Map, Set.. etc 🤧
        message.reactedBy = new Map(Object.entries(message.reactedBy));
        //convert seenBy to Set
        message.seenBy = new Set(Object.keys(message.seenBy));

        //Ready to go ... ✨✨
        
        if (message instanceof TextMessageObj){
            message.message = filterBadWords(message.message);
        } else if (message instanceof FileMessageObj){
            console.log('File message received', message.loaded);
            if (message instanceof ImageMessageObj){
                message.url = message.thumbnail;
                //clear the thumbnail
                message.thumbnail = '';
            } else if (message instanceof AudioMessageObj){
                message.audio = new Audio(message.url);
            }
        }

        message.sent = true;
        message.id = messageId;
        messageDatabase.add(message);
        lastMessageId.set(messageId);
        notice.set(message);
        console.log('new message received');

        console.log('Done updating message database');

    });

    socket.on('linkPreviewData', (messageId: string, data: {title: string, description: string, image: string, url: string}) => {

        if (!messageDatabase.has(messageId)){
            return;
        }

        messageDatabase.update((messages) => {

            return messages;
        });
    });

    socket.on('deleteMessage', (messageId: string, uid: string) => {

        try{

            console.log('delete req received');
            
            if (!messageDatabase.has(messageId) || !$chatRoomStore.userList[uid]){
                return;
            }

            let message = messageDatabase.getMessage(messageId) as TextMessageObj;

            if (message.sender == uid){

                const classList = message.classList;
                const sender = message.sender;
                const sent = message.sent;
                const id = message.id;

                messageDatabase.update((messages) => {
                    //change the message to "This message was deleted"
                    message = new TextMessageObj();
                    message.message = 'This message was deleted';
                    message.id = ``
                    message.type = 'deleted';
                    message.replyTo = '';
                    message.sender = sender;
                    message.sent = sent;
                    message.classList = classList.replace('title', '');

                    messages[messageDatabase.getIndex(id)] = message;

                    return messages;
                });
            }
        } catch (e){
            console.log(e);
        }
    });

    socket.on('location', (coord: {latitude: number, longitude: number}, id: string, uid: string) => {
        
        if (!$chatRoomStore.userList[uid]){
            return;
        }

        const message = new LocationMessageObj(coord.latitude, coord.longitude, id, uid);

        messageDatabase.add(message);
    });

    socket.on("server_message", (msg: { text: string; id: string }, type: string) => {
            //console.log(msg);

            const message: ServerMessageObj = new ServerMessageObj();
            message.text = msg.text;
            message.id = msg.id;
            message.type = type;

            messageDatabase.add(message);
        },
    );

    socket.on("react", (messageId: string, uid: string, react: string) => {

        if (!uid || !messageId || !$chatRoomStore || !$chatRoomStore.userList[uid] || !messageDatabase.has(messageId)){
            //console.log("invalid seen");
            return;
        }

        const message = messageDatabase.getMessage(messageId) as MessageObj;

        messageDatabase.update((messages) => {
            if (message && message instanceof MessageObj) {
                //if same react is clicked again, remove it
                if (message.reactedBy.get(uid) == react) {
                    message.reactedBy.delete(uid);
                } else {
                    //if its my own react
                    if ($myId == uid){
                        if (!$reactArray.reacts.includes(react) && emojis.includes(react)){
                            reactArray.update((val) => {
                                val.last = react;
                                return val;
                            });
                            localStorage.setItem('lastReact', react);
                        }
                    }
                    message.reactedBy.set(uid, react);
                }
            }
            return messages;
        });
    });

    socket.on('updateUserList', (users: {[key: string]: User}) => {
        chatRoomStore.update((chatRoom) => {
            chatRoom.userList = users
            return chatRoom;
        });
    });

    socket.on("seen", (uid: string, messageId: string) => {
        if (!uid || !messageId || !$chatRoomStore || !$chatRoomStore.userList[uid] || !messageDatabase.has(messageId)){
            //console.log("invalid seen");
            return;
        }

        chatRoomStore.update((chatRoom) => {
            chatRoom.userList[uid].lastSeenMessage = messageId;
            return chatRoom;
        });

        const message = messageDatabase.getMessage(messageId) as MessageObj;

        messageDatabase.update((messages) => {

            if (message && message instanceof MessageObj) {
                message.seenBy.add(uid);
            }

            return messages;
        });
    });

    const userTypingSet = new Set<string>();

    socket.on("typing", (uid: string, event: "start" | "end") => {
        if (event == "start") {
            userTypingSet.add(uid);
        } else {
            userTypingSet.delete(uid);
        }

        if (userTypingSet.size > 0) {
            // 1 person typing: 'Alex is typing'
            // 2 people typing: 'Alex and max is typing'
            // 3 people typing: 'Alex, max and 1 other is typing'
            // 4 people typing: 'Alex, max and length-2 others are typing'
            const userIdArray = Array.from(userTypingSet);

            switch (userTypingSet.size) {
                case 1:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.name
                        } is typing`,
                    );
                    break;
                case 2:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.name
                        } and ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.name
                        } are typing`,
                    );
                    break;
                case 3:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.name
                        }, ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.name
                        } and 1 other are typing`,
                    );
                    break;
                default:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.name
                        }, ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.name
                        } and ${userTypingSet.size - 2} others are typing`,
                    );
                    break;
            }
        } else {
            userTypingString.set("");
        }
    });
</script>