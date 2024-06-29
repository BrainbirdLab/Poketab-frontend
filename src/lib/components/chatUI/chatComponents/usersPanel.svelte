<script lang="ts">
    import { fly } from "svelte/transition";
    import { chatRoomStore, myId } from "$lib/store";
    import { flip } from "svelte/animate";
</script>

{#if Object.entries($chatRoomStore.userList).length > 0}
<div class="users">
    <li class="user">
        <div class="avt">
            <img
                src="/images/avatars/{$chatRoomStore.userList[$myId]
                    .avatar}(custom).webp"
                height="30"
                width="30"
                alt="{$chatRoomStore.userList[$myId].avatar}"
            />
        </div>
        <span>{$chatRoomStore.userList[$myId].avatar} (You)</span>
    </li>
    {#each Object.entries($chatRoomStore.userList).filter(([id, _]) => id !== $myId) as [id, User], i (id)}
        <li
            class="user"
            out:fly={{ x: -20, duration: 100 }}
            animate:flip={{ duration: 200 }}
        >
            <div class="avt">
                <img
                    src="/images/avatars/{User.avatar}(custom).webp"
                    height="30"
                    width="30"
                    alt="{User.avatar}"
                />
            </div>
            <span>{User.avatar}</span>
        </li>
    {/each}
</div>
{/if}

<style lang="scss">
    .users {
        display: flex;
        flex-direction: column;
        width: 100%;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 5px;
        padding: 10px 0;
        overflow: scroll;
    }

    .user {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 5px;
        font-size: 0.8rem;

        .avt {
            position: relative;
            background: var(--glass-color);
            border-radius: 50%;

            img {
                display: block;
                height: 35px;
                width: 35px;
                aspect-ratio: 1/1;
            }
        }
    }
</style>
