<script lang="ts">
    import { fly } from "svelte/transition";
    import { chatRoomStore, myId } from "$lib/store";
    import { flip } from "svelte/animate";
    import { addState } from "../stateManager.svelte";

    function clickHandler(node: HTMLElement) {
        node.addEventListener("click", async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.target) {
                const target: HTMLElement = e.target as HTMLElement;
                if (target.classList.contains("e2eKey")) {
                    const uid = target.dataset.uid;
                    if (uid) {
                        addState('', { showPublicKeysOf: uid });
                    }
                }
            }
        });
    }
</script>

{#if Object.entries($chatRoomStore.userList).length > 0}
<div class="users" use:clickHandler>
    <li class="user">
        <div class="userInfo">
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
        </div>
        <div class="e2eKey" title="View public key" data-uid="{$myId}">
            <i class="fa-solid fa-lock"></i>
        </div>
    </li>
    {#each Object.entries($chatRoomStore.userList).filter(([id, _]) => id !== $myId) as [id, User], i (id)}
        <li
            class="user"
            out:fly={{ x: -20, duration: 100 }}
            animate:flip={{ duration: 200 }}
        >
            <div class="userInfo">
                <div class="avt">
                    <img
                        src="/images/avatars/{User.avatar}(custom).webp"
                        height="30"
                        width="30"
                        alt="{User.avatar}"
                    />
                </div>
                <span>{User.avatar}</span>
            </div>
            <div class="e2eKey" title="View public key" data-uid="{User.uid}">
                <i class="fa-solid fa-lock"></i>
            </div>
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
        width: 100%;
        overflow: scroll;
    }

    .user {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
        font-size: 0.8rem;
        width: 100%;

        .userInfo {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }

        .e2eKey {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-size: 1rem;
            padding: 4px;
            width: 30px;
            height: 30px;
            min-height: 30px;
            min-width: 30px;
            border-radius: 50%;
            color: var(--secondary-dark);
            cursor: pointer;
            &:hover{
                background: var(--glass-color);
            }
            i {
                font-size: inherit;
                color: inherit;
                pointer-events: none;
            }
        }

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
