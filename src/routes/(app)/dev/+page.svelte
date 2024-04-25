<script lang="ts">
    import "$lib/styles/atom.css";
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import Messages from "$lib/components/chatUI/chatComponents/messages.svelte";
    import { onMount } from "svelte";
    import { chatRoomStore, currentPage, formActionButtonDisabled, joinedChat, myId, splashMessage } from "$lib/store";

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

    $myId = "uid-1";

    
    let mounted = false;
    joinedChat.set(true);
    currentPage.set("chat");
    splashMessage.set("");
    formActionButtonDisabled.set(false);
    
    onMount(() => {
        mounted = true;
    });

</script>

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