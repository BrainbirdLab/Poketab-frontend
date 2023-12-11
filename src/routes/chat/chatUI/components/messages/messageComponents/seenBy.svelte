<script lang="ts">
    import { chatRoomStore } from "$lib/store";
    import { fly } from "svelte/transition";
    export let seenBy: {[uid: string]: boolean};
    export let messageId: string;
</script>

{#if Object.keys(seenBy).length > 0}
{#key seenBy}
<div class="seenBy">
    {#each Object.keys(seenBy) as uid}
        {#if $chatRoomStore.userList[uid]?.lastSeenMessage == messageId}
            <img alt="seen" data-uid="{uid}" src="/images/avatars/{$chatRoomStore.userList[uid].avatar}(custom)-mini.webp" />
        {/if}
    {/each}
</div>
{/key}
{/if}