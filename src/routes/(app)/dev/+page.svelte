<script lang="ts">
    import "$lib/styles/atom.css";
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import { onMount } from "svelte";
    import { chatRoomStore, currentPage, DEVMODE, formActionButtonDisabled, joinedChat, myId, splashMessage } from "$lib/store.svelte";
    import { messageDatabase, TextMessageObj } from "$lib/messageStore.svelte";
    import { makeKeyPair } from "$lib/e2e/encryption";

    chatRoomStore.value.Key = "00-000-00";
    chatRoomStore.value.maxUsers = 2;
    
    let mounted = $state(false);
    joinedChat.value = true;
    currentPage.value = "chat";
    splashMessage.value = "";
    formActionButtonDisabled.value = false;

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

        DEVMODE.value = true;

        myId.value = "uid-0";
        const myPair = await makeKeyPair();
    

        chatRoomStore.value.userList['uid-0'] = {
            avatar: 'Pikachu',
            uid: 'uid-0',
            publicKey: myPair.publicKey,
        }

        const key1 = await makeKeyPair();
        const key2 = await makeKeyPair();

        chatRoomStore.value.userList['uid-1'] = {
            avatar: 'Charmander',
            uid: 'uid-1',
            publicKey: key1.publicKey,
        }

        chatRoomStore.value.userList['uid-2'] = {
            avatar: 'Eevee',
            uid: 'uid-2',
            publicKey: key2.publicKey,
        }

        mounted = true;
    });

</script>

<svelte:document onkeydown={(e) => {
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
    <ChatInterface />
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
        background: rgba(0, 0, 0, var(--fade)) var(--pattern);
        transition: background 500ms;
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        background-attachment: fixed;
    }
</style>