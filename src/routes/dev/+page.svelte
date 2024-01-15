<script lang="ts">
    import "$lib/styles/atom.css";
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import { onMount } from "svelte";
    import { chatRoomStore, myId } from "$lib/store";



    $chatRoomStore.Key = "00-000-00";
    $chatRoomStore.maxUsers = 2;
    $chatRoomStore.userList = {
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
    };

    $myId = "uid-1";

    let mounted = false;

    onMount(() => {

        mounted = true;

        console.log("Mounted root +page.svelte");
    });

</script>

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
        background-blend-mode: soft-light;
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
    }
</style>