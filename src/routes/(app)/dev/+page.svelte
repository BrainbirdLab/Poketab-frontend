<script lang="ts">
    import "$lib/styles/atom.css";
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Messages from "$lib/components/chatUI/chatComponents/messages.svelte";
    import { onMount } from "svelte";
    import { chatRoomStore, currentPage, formActionButtonDisabled, joinedChat, myId, splashMessage } from "$lib/store";
    import { messageDatabase, TextMessageObj } from "$lib/messageTypes";
    import { makeKeyPair } from "$lib/e2e/encryption";

    $chatRoomStore.Key = "00-000-00";
    $chatRoomStore.maxUsers = 2;
    /*$chatRoomStore.userList = {
        "uid-1": {
            uid: "uid-1",
            name: "User 1",
            avatar: "pikachu",
            lastSeenMessage: null,
        },
        "uid-2": {
            uid: "uid-2",
            name: "User 2",
            avatar: "squirtle",
            lastSeenMessage: null,
        },
        "uid-3": {
            uid: "uid-3",
            name: "User 3",
            avatar: "bullbasaur",
            lastSeenMessage: null,
        },
        "uid-4": {
            uid: "uid-4",
            name: "User 4",
            avatar: "charmander",
            lastSeenMessage: null,
        },
        "uid-5": {
            uid: "uid-5",
            name: "User 5",
            avatar: "eevee",
            lastSeenMessage: null,
        },
        "uid-6": {
            uid: "uid-6",
            name: "User 6",
            avatar: "jigglypuff",
            lastSeenMessage: null,
        },
    };
    */

    
    let mounted = false;
    joinedChat.set(true);
    currentPage.set("chat");
    splashMessage.set("");
    formActionButtonDisabled.set(false);

    function insertRecieveMsg(uid: string) {
        const msg = crypto.randomUUID();
        const id = crypto.randomUUID();
        const msgObj = new TextMessageObj();
        msgObj.baseType = 'text';
        msgObj.id = id;
        msgObj.sender = uid;
        msgObj.message = msg;
    
        messageDatabase.add(msgObj);
    }
    
    onMount( async () => {

        $myId = "uid-0";
        const myPair = await makeKeyPair();
    

        $chatRoomStore.userList['uid-0'] = {
            avatar: 'Pikachu',
            uid: 'uid-0',
            publicKey: myPair.publicKey,
        }

        const key1 = await makeKeyPair();
        const key2 = await makeKeyPair();

        $chatRoomStore.userList['uid-1'] = {
            avatar: 'Charmander',
            uid: 'uid-1',
            publicKey: key1.publicKey,
        }

        $chatRoomStore.userList['uid-2'] = {
            avatar: 'Eevee',
            uid: 'uid-2',
            publicKey: key2.publicKey,
        }

        mounted = true;
    });

</script>

<svelte:document on:keydown={(e) => {
    if (e.altKey) {
        switch (e.key) {
            case '1':
                insertRecieveMsg('uid-1');
                break;
            case '2':
                insertRecieveMsg('uid-2');
                break;
        }
    }
}} />

{#if mounted}
<div class="content">
    <ChatInterface>
        <Messages slot="messages"/>
    </ChatInterface>
</div>
{/if}

<style>
    .content{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        width: 100%;
        inset: 0;
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>