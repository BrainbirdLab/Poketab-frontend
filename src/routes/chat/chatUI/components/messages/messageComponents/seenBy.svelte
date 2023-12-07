<script lang="ts">
    import { chatRoomStore } from "$lib/store";
    export let seenBy: {[key: string]: boolean};
</script>

{#if Object.keys(seenBy).length > 0}
{#key seenBy}
<div class="seenBy">
    {#each Object.keys(seenBy) as uid}
        <img alt="seen" src="/images/avatars/{$chatRoomStore.userList[uid].avatar}(custom)-mini.webp" />
    {/each}
</div>
{/key}
{/if}