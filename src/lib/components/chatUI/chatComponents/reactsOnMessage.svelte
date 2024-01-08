<script lang="ts">
    import type { MessageObj } from "$lib/messages";
    import { chatRoomStore } from "$lib/store";
    import { eventTriggerMessageId, messageDatabase } from "$lib/messages";
    import { showReactsOnMessageModal } from "$lib/components/modalManager";
    import { fly } from "svelte/transition";

    // [uid: string]: react-emoji
    $: reacts = ($messageDatabase.get($eventTriggerMessageId) as MessageObj)?.reactedBy || {};

    let selectedReact = 'All';

    function handleClick(node: HTMLElement) {
        node.onclick = (e) => {
            const target = e.target as HTMLElement;

            if (target == node){
                $eventTriggerMessageId = '';
                showReactsOnMessageModal.set(false);
            }
        }

        return {
            destroy() {
                node.onclick = null;
            }
        }
    }

</script>

{#if $showReactsOnMessageModal}
<div class="wrapper" use:handleClick transition:fly={{y: 10, duration: 100}}>
    <div class="reactsOnMessage">
        <div class="users">
            {#each Object.entries(reacts) as [uid, react]}
                <div class="user">
                    <img src="/images/avatars/{$chatRoomStore.userList[uid].avatar}(custom).png" alt="{$chatRoomStore.userList[uid].name}'s Avatar">
                    {$chatRoomStore.userList[uid].name}
                    <div class="react-emoji">{react}</div>
                </div>
            {/each}
        </div>
        <div class="totalReactsButtons" in:fly|global={{x: 10, duration: 150}}>
            <!-- Show which reacts appear how many times -->
            <label>
              <input type="radio" bind:group={selectedReact} value="All"/>
              <div class="item">
                All ({Object.keys(reacts).length})
              </div>
            </label>
            {#each Object.values(reacts) as react}
            <label>
                <input type="radio" bind:group={selectedReact} value={react}/>
                <div class="item">
                    <span class="react-emoji">{react}</span>
                    <span class="react-count">{Object.values(reacts).filter(r => r === react).length}</span>
                </div>
            </label>
            {/each}
          </div>
    </div>
</div>
{/if}

<style lang="scss">

    .wrapper{
        position: absolute;
        top: 0;
        left: 0;
        z-index: 50;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        gap: 10px;
    }

    .totalReactsButtons{
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: auto;
        width: 100%;

        label{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            cursor: pointer;

            .item{
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                gap: 3px;
                padding: 2px 5px;
                border-radius: 15px;
                transition: 100ms ease-in-out;
                cursor: pointer;
                &:hover{
                    background: var(--glass);
                }
            }

            input{
                display: none;
            }

            input:checked + .item{
                background: var(--secondary-dark);
            }

        }
    }

    .reactsOnMessage{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        background: var(--primary-dark);
        padding: 15px 10px 10px 10px;
        width: 300px;
        height: 350px;
        max-width: 98vw;
        border-radius: 15px;
        filter: drop-shadow(2px 4px 6px var(--shadow));

        .users{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            overflow-y: scroll;
            width: 100%;
            gap: 10px;

            .user{
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                width: 100%;
                gap: 5px;
                font-size: 1rem;

                img{
                    height: 30px;
                    width: 30px;
                    border-radius: 50%;
                }

                .react-emoji{
                    font-size: 1.2rem;
                    font-weight: 500;
                    margin-left: auto;
                    color: var(--secondary-dark);
                }
            }
        }
    }
</style>