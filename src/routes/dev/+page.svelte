<script lang="ts">
    import "$lib/styles/atom.css";
    import ChatInterface from "$lib/components/chatUI/chatInterface.svelte";
    import { onMount, tick } from "svelte";
    import { chatRoomStore, myId } from "$lib/store";
    import { messageDatabase, TextMessageObj, StickerMessageObj, FileMessageObj, AudioMessageObj } from "$lib/messageTypes";

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
        
        const audio = new Audio("./sounds/audio.mp3");

        audio.onloadeddata = () => {
            //console.log("audio loaded");
            //console.log(audio.duration);
    
            messageDatabase.update((msg) => {
        
                const m = new AudioMessageObj();
                m.audio.src = "./sounds/audio.mp3";
                m.sender = "uid-1";
                m.url = "./sounds/audio.mp3";
                m.name = "Audio 1";
                m.classList = "self start";
                m.sent = true;
        
                msg.set("msg-1", m);

                const m2 = new AudioMessageObj();
                m2.audio.src = "./sounds/audio2.mp3";
                m2.sender = "uid-1";
                m2.url = "./sounds/audio2.mp3";
                m2.name = "Audio 2";
                m2.classList = "self end";
                m2.sent = true;

                msg.set("msg-2", m2);
    
                return msg;
            });
        }


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