<script lang="ts">
    import {
        MessageObj,
        TextMessageObj,
        StickerMessageObj,
        LocationMessageObj,
        messageDatabase,
        lastMessageId,
        notice,
        ServerMessageObj,
        FileMessageObj,
        ImageMessageObj,
        AudioMessageObj,
    } from "$lib/messageTypes";
    import {
        chatRoomStore,
        userTypingString,
        myId,
        reactArray,
        incommingXHRs,
        outgoingXHRs,
        myPrivateKey,
    } from "$lib/store";
    import { filterBadWords } from "$lib/components/chatUI/chatComponents/messages/messageUtils";
    import { socket, API_URL } from "$lib/socket";
    import { emojis, playMessageSound } from "$lib/utils";
    import { onDestroy } from "svelte";
    import { decryptMessage, decryptSymmetricKey, importPublicKey, stringToBuffer } from "$lib/e2e/encryption";
    import { infoMessage } from "$lib/utils/debug";
    import { getLinkMetadata } from "$lib/linkmeta";

    socket.on("newMessage", async (encryptedMessage: ArrayBuffer, smKey: ArrayBuffer, messageId: string) => {
        if (!encryptedMessage || !smKey || !messageId) {
            console.log("Invalid message");
            return;
        }

        //decrypt the symmetric key
        const dSmKey = await decryptSymmetricKey(smKey, $myPrivateKey);
        //decrypt the message
        const decrypteBuffer = await decryptMessage(encryptedMessage, dSmKey);
        //convert the buffer to MessageObj
        let message = JSON.parse(new TextDecoder().decode(decrypteBuffer)) as MessageObj;

        if (message.baseType == "text" || message.baseType == "deleted") {
            message = Object.setPrototypeOf(message, TextMessageObj.prototype);
        } else if (message.baseType == "sticker") {
            message = Object.setPrototypeOf(
                message,
                StickerMessageObj.prototype,
            );
        } else if (message.baseType == "file") {
            //basetype is file but it can be 'file', 'image' or 'audio'
            message = Object.setPrototypeOf(message, FileMessageObj.prototype);
        } else if (message.baseType === "image") {
            message = Object.setPrototypeOf(message, ImageMessageObj.prototype);
        } else if (message.baseType === "audio") {
            message = Object.setPrototypeOf(message, AudioMessageObj.prototype);
        } else {
            console.log('Invalid message: ', message);
            return;
        }

        message.smKey = dSmKey;
        //The message is recieved as Object, All properties of type Map, Set are lost as they become Object.
        //So we need to convert them back to Map, Set.. etc 🤧
        message.reactedBy = new Map(Object.entries(message.reactedBy));
        //convert seenBy to Set
        message.seenBy = new Set(Object.keys(message.seenBy));

        //Ready to go ... ✨✨
        if (message instanceof TextMessageObj) {
            message.message = filterBadWords(message.message);
        } else if (message instanceof FileMessageObj) {
            message.loadScheme = "upload";
            if (message instanceof ImageMessageObj) {
                message.url = message.thumbnail;
                //clear the thumbnail
                message.thumbnail = "";
            } else if (message instanceof AudioMessageObj) {
                message.audio = new Audio(message.url);
            }
        }

        message.sent = true;
        message.id = messageId;
        messageDatabase.add(message);
        lastMessageId.set(messageId);
        notice.set(message);
        getLinkMetadata(message);

        //audios
        if (message instanceof StickerMessageObj) {
            playMessageSound("sticker");
        } else {
            playMessageSound("incoming");
        }
    });

    socket.on("fileDownload", (messageId: string, sender: string) => {

        if (!$chatRoomStore.userList[sender]) {
            return;
        }

        if ($myId === sender) {
            return;
        }

        //get the file via xhr
        const message = messageDatabase.getMessage(messageId) as FileMessageObj;

        const xhr = new XMLHttpRequest();

        incommingXHRs.update((xhrs) => {
            xhrs.set(messageId, xhr);
            return xhrs;
        });

        xhr.responseType = "blob";

        xhr.open(
            "GET",
            `${API_URL}/api/download/${$chatRoomStore.Key}/${$myId}/${messageId}`,
            true,
        );

        xhr.onload = async function () {
            if (this.status === 200) {
                if (message.smKey == null) {
                    console.log("Symmetric key is null");
                    return;
                }

                const blob = this.response; // sent as application/octet-stream

                //blob to buffer
                const encryptedBuffer = await new Response(blob).arrayBuffer();

                //decrypt the blob
                const decryptedBuffer = await decryptMessage(encryptedBuffer, message.smKey);

                //blob is raw file data
                const file = new File([decryptedBuffer], message.name, {
                    type: message.type,
                });

                const url = URL.createObjectURL(file);

                messageDatabase.update((messages) => {
                    if (message instanceof AudioMessageObj) {
                        message.audio = new Audio();
                        message.audio.src = url;
                    } else {
                        message.url = url;
                    }
                    message.loadScheme = "download";
                    message.loaded = 100;

                    return messages;
                });
            }
        };

        //progress
        xhr.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = (e.loaded / e.total) * 100;
                //update message

                messageDatabase.update((messages) => {
                    message.loadScheme = "download";
                    message.loaded = Math.round(percent);

                    return messages;
                });
            }
        };

        xhr.send();
    });

    socket.on("deleteMessage", (messageId: string, uid: string) => {
        try {

            if (
                !messageDatabase.has(messageId) ||
                !$chatRoomStore.userList[uid]
            ) {
                return;
            }

            let message = messageDatabase.getMessage(
                messageId,
            ) as TextMessageObj;

            if (message.sender == uid) {
                const classList = message.classList;
                const sender = message.sender;
                const sent = message.sent;
                const id = message.id;

                if ($incommingXHRs.has(id) || $outgoingXHRs.has(id)) {
                    $incommingXHRs.get(id)?.abort();
                    $incommingXHRs.delete(id);

                    $outgoingXHRs.get(id)?.abort();
                    $outgoingXHRs.delete(id);

                }

                messageDatabase.update((messages) => {
                    //change the message to "This message was deleted"
                    message = new TextMessageObj();
                    message.message = "This message was deleted";
                    message.id = "";
                    message.type = "deleted";
                    message.replyTo = "";
                    message.sender = sender;
                    message.sent = sent;
                    message.classList = classList.replace("title", "");

                    messages[messageDatabase.getIndex(id)] = message;

                    return messages;
                });
            }
        } catch (e) {
            console.log(e);
        }
    });

    socket.on(
        "location",
        (
            coord: { latitude: number; longitude: number },
            id: string,
            uid: string,
        ) => {
            if (!$chatRoomStore.userList[uid]) {
                return;
            }

            const message = new LocationMessageObj(
                coord.latitude,
                coord.longitude,
                id,
                uid,
            );

            playMessageSound("location");

            messageDatabase.add(message);
        },
    );

    socket.on(
        "server_message",
        (msg: { text: string; id: string }, type: "join" | "leave") => {
            const message: ServerMessageObj = new ServerMessageObj();
            message.text = msg.text;
            message.id = msg.id;
            message.type = type;

            if (message.type == "join") {
                playMessageSound("join");
            } else if (message.type == "leave") {
                playMessageSound("leave");
            }

            messageDatabase.add(message);
        },
    );

    socket.on("react", (messageId: string, uid: string, react: string) => {
        if (
            !uid ||
            !messageId ||
            !$chatRoomStore ||
            !$chatRoomStore.userList[uid] ||
            !messageDatabase.has(messageId)
        ) {
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
                    if ($myId == uid) {
                        if (
                            !$reactArray.reacts.includes(react) &&
                            emojis.includes(react)
                        ) {
                            // update reactArray
                            reactArray.update((val) => {
                                val.last = react;
                                return val;
                            });
                            localStorage.setItem("lastReact", react);
                        }
                    }
                    //remove previous react
                    message.reactedBy.delete(uid);
                    //add new react. So that it appears at the end
                    message.reactedBy.set(uid, react);
                    playMessageSound("react");
                }
            }
            return messages;
        });
    });

    socket.on("newUser", (user: { avatar: string, uid: string, publicKey: string }) => {
        //import the public key
        importPublicKey(stringToBuffer(user.publicKey)).then((key) => {
            chatRoomStore.update((chatRoom) => {
                chatRoom.userList[user.uid] = {
                    avatar: user.avatar,
                    uid: user.uid,
                    publicKey: key,
                    lastSeenMessage: "",
                };
                return chatRoom;
            });
            infoMessage(`User ${user.avatar} joined the chat 🥳`, 'join');
        });
    });

    socket.on('userLeft', (uid: string) => {
        if (!$chatRoomStore.userList[uid]) {
            return;
        }
        const avatar = $chatRoomStore.userList[uid].avatar;
        chatRoomStore.update((chatRoom) => {
            delete chatRoom.userList[uid];
            return chatRoom;
        });
        infoMessage(`User ${avatar} left the chat 🥺`, 'leave');
    });

    socket.on("seen", (uid: string, messageId: string) => {
        if (
            !uid ||
            !messageId ||
            !$chatRoomStore ||
            !$chatRoomStore.userList[uid] ||
            !messageDatabase.has(messageId)
        ) {
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
            //playMessageSound("typing");

            if (!userTypingSet.has(uid)){
                userTypingSet.add(uid);
                playMessageSound("typing");
            }

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
                            ]?.avatar
                        } is typing`,
                    );
                    break;
                case 2:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.avatar
                        } and ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.avatar
                        } are typing`,
                    );
                    break;
                case 3:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.avatar
                        }, ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.avatar
                        } and 1 other are typing`,
                    );
                    break;
                default:
                    userTypingString.set(
                        `${
                            $chatRoomStore.userList[
                                userIdArray.at(-1) as string
                            ]?.avatar
                        }, ${
                            $chatRoomStore.userList[
                                userIdArray.at(-2) as string
                            ]?.avatar
                        } and ${userTypingSet.size - 2} others are typing`,
                    );
                    break;
            }
        } else {
            userTypingString.set("");
        }
    });

    onDestroy(() => {
        socket.off("newMessage");
        socket.off("deleteMessage");
        socket.off("location");
        socket.off("server_message");
        socket.off("react");
        socket.off("updateUserList");
        socket.off("seen");
        socket.off("typing");
    });
</script>
