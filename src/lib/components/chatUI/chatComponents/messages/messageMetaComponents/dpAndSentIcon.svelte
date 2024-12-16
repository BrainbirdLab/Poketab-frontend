<script lang="ts">
    import { chatRoomStore, myId } from "$lib/store.svelte";

    interface Props {
        senderId: string;
        isSent: boolean;
    }

    let { senderId, isSent }: Props = $props();

</script>

<div class="replyIcon">
    <i class="fa-solid fa-reply"></i>
</div>
{#if !isSent}
    <div class="sent"><i class="fa-regular fa-paper-plane"></i></div>
{/if}
{#if senderId != myId.value}
    <div class="avatar">
        <img src="/images/avatars/{chatRoomStore.value.userList[senderId]?.avatar || 'Rip'}(custom).webp" width="30px" height="30px" alt="avatar"/>
    </div>
{/if}