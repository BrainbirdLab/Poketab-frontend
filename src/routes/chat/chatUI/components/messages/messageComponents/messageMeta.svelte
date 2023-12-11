<script lang="ts">
    import { chatRoomStore, selfInfoStore } from "$lib/store";
    import type { MessageObj } from "$lib/messages";

    export let sender: string;
    export let sent: boolean;
</script>

<div class="replyIcon">
    <i class="fa-solid fa-reply"></i>
</div>
{#if !sent}
    <div class="sent"><i class="fa-regular fa-paper-plane"></i></div>
{/if}
{#if sender != $selfInfoStore.uid}
    <div class="avatar">
        <img src="/images/avatars/{($chatRoomStore.userList[sender]?.avatar)}(custom).webp" width="30px" height="30px" alt="avatar">
    </div>
{/if}