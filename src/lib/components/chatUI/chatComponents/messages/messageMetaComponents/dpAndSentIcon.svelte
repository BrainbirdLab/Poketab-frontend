<script lang="ts">
    import { chatRoomStore, myId } from "$lib/store";

    export let senderId: string;
    export let isSent: boolean;

</script>

<div class="replyIcon">
    <i class="fa-solid fa-reply"></i>
</div>
{#if !isSent}
    <div class="sent"><i class="fa-regular fa-paper-plane"></i></div>
{/if}
{#if senderId != $myId}
    <div class="avatar">
        <img src="/images/avatars/{$chatRoomStore.userList[senderId]?.avatar || 'Rip'}(custom).webp" width="30px" height="30px" alt="avatar"/>
    </div>
{/if}