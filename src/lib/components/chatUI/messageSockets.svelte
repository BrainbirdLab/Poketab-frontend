<script lang="ts">

    import { MessageObj, TextMessageObj, StickerMessageObj, LocationMessageObj, messageDatabase, lastMessageId, notice, ServerMessageObj } from "$lib/messages";
    import { type User, chatRoomStore, userTypingString, selfInfoStore, reactArray } from "$lib/store";
    import { filterBadWords, makeClasslist } from "$lib/components/messages/messageUtils";
    import { socket } from "$lib/components/socket";
    import { emojis } from "$lib/utils";

        socket.on("newMessage", (message: MessageObj, messageId: string) => {
        //console.log(message);

        if(message.kind == 'text'){
            message = Object.setPrototypeOf(message, TextMessageObj.prototype);
        } else if (message.kind == 'sticker'){
            message = Object.setPrototypeOf(message, StickerMessageObj.prototype);
        } else if (message.kind == 'deleted'){
            message = Object.setPrototypeOf(message, TextMessageObj.prototype);
        } else if (message.kind == 'location'){
            message = Object.setPrototypeOf(message, LocationMessageObj.prototype);
        }

        if (message instanceof TextMessageObj){
            message.message = filterBadWords(message.message);
        }

        messageDatabase.update((messages) => {
            message.classList = makeClasslist(message);
            message.sent = true;
            messages.set(messageId, message);
            return messages;
        });

        lastMessageId.set(messageId);
        notice.set(message);
    });

    socket.on('linkPreviewData', (messageId: string, data: {title: string, description: string, image: string, url: string}) => {
        if (!$messageDatabase.has(messageId)){
            return;
        }

        console.log('link preview data received');
        console.log(data);
        
        messageDatabase.update((messages) => {
            const message = messages.get(messageId) as MessageObj;
            console.log(message.kind);
            console.log(message instanceof TextMessageObj);
            if (message && message instanceof TextMessageObj){
                console.log('updating link preview data');
                message.linkPreviewData = data;
            }
            return messages;
        });
    });

    socket.on('deleteMessage', (messageId: string, uid: string) => {

        try{

            console.log('delete req received');
            
            if (!$messageDatabase.has(messageId)){
                return;
            }

            let message = $messageDatabase.get(messageId) as TextMessageObj;

            if (message.sender == uid){
                if (!(message instanceof TextMessageObj)){
                    message = Object.setPrototypeOf(message, TextMessageObj.prototype);
                }
                message.message = 'This message was deleted';
                message.kind = 'deleted';
                message.type = 'deleted';
                message.replyTo = '';
                messageDatabase.update((messages) => {
                    //change the message to "This message was deleted"
                    if (message.classList.includes('title')){
                        //remove the title
                        message.classList = message.classList.replace('title', '');
                    }
                    messages.set(messageId, message);
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

        messageDatabase.update((messages) => {
            const message = new LocationMessageObj(coord.latitude, coord.longitude, uid);

            messages.set(id, message);

            return messages;
        });
    });

    socket.on("server_message", (msg: { text: string; id: string }, type: string) => {
            //console.log(msg);

            messageDatabase.update((messages) => {
                const message: ServerMessageObj = new ServerMessageObj();
                message.text = msg.text;
                message.type = type;

                messages.set(msg.id, message);

                return messages;
            });
        },
    );

    socket.on("react", (messageId: string, uid: string, react: string) => {
        messageDatabase.update((messages) => {
            const message = messages.get(messageId) as MessageObj;
            if (message && message instanceof MessageObj) {
                //if same react is clicked again, remove it
                if (message.reactedBy[uid] == react) {
                    //message.reactedBy.delete(uid);
                    delete message.reactedBy[uid];
                } else {
                    //if its my own react
                    if ($selfInfoStore.uid == uid){
                        if (!$reactArray.reacts.includes(react) && emojis.includes(react)){
                            reactArray.update((val) => {
                                val.last = react;
                                return val;
                            });
                            localStorage.setItem('lastReact', react);
                        }
                    }
                    //message.reactedBy.set(uid, react);
                    message.reactedBy[uid] = react;
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
        if (!uid || !messageId || !$chatRoomStore || !$chatRoomStore.userList[uid]) {
            //console.log("invalid seen");
            return;
        }

        chatRoomStore.update((chatRoom) => {
            chatRoom.userList[uid].lastSeenMessage = messageId;
            return chatRoom;
        });

        messageDatabase.update((messages) => {
            const message = messages.get(messageId) as MessageObj;

            if (message && message instanceof MessageObj) {
                message.seenBy[uid] = true;
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