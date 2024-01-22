<script lang="ts">
    import { chatRoomStore, myId } from "$lib/store";

    export let sender: string;
    export let sent: boolean;

</script>

<div class="replyIcon">
    <i class="fa-solid fa-reply"></i>
</div>
{#if !sent}
    <div class="sent"><i class="fa-regular fa-paper-plane"></i></div>
{/if}
{#if sender != $myId}
    <div class="avatar">
        <img src="/images/avatars/{$chatRoomStore.userList[sender]?.avatar || 'rip'}(custom).webp" width="30px" height="30px" alt="avatar">
    </div>
{/if}