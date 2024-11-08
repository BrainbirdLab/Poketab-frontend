<script lang="ts">
    import { fly } from "svelte/transition";
    import { chatRoomStore, myId } from "$lib/store.svelte";
    import { flip } from "svelte/animate";
    import UserItem from "./userItem.svelte";

    let targetId = $state('');

    function clickHandler(node: HTMLElement) {
        node.addEventListener("click", async (e) => {
            e.stopPropagation();
            e.preventDefault();
            if (e.target) {
                const target: HTMLElement = e.target as HTMLElement;
                if (target.classList.contains("e2eKey")) {
                    const uid = target.dataset.uid;
                    if (uid) {
                        if (targetId == uid) {
                            targetId = '';
                        } else {
                            targetId = uid;
                        }
                    }
                }
            }
        });
    }
</script>

{#if Object.entries($chatRoomStore.userList).length > 0}
<div class="users" use:clickHandler>
    <div class="user">
        <UserItem avatar={$chatRoomStore.userList[myId.value].avatar} uid={myId.value} showId={targetId} />
    </div>
    {#each Object.entries($chatRoomStore.userList).filter(([id, _]) => id !== myId.value) as [id, _], i (id)}
        <li
            class="user"
            out:fly={{ x: -20, duration: 100 }}
            animate:flip={{ duration: 200 }}
        >
            <UserItem avatar={$chatRoomStore.userList[id].avatar} uid={id} showId={targetId} />
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
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        gap: 5px;
        font-size: 0.8rem;
        width: 100%;
    }
</style>
