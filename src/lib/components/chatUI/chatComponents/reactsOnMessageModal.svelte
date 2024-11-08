<script lang="ts">
    import { chatRoomStore, myId } from "$lib/store.svelte";
    import { eventTriggerMessageId, type MessageObj, messageDatabase } from "$lib/messageTypes";
    import { fly } from "svelte/transition";
    import Modal from "./modal.svelte";
    import { page } from "$app/stores";
    import { onDestroy } from "svelte";

    let message = $derived($messageDatabase[messageDatabase.getIndex($eventTriggerMessageId)] as MessageObj);

    // [uid: string]: react-emoji
    let reacts = $derived(message?.reactedBy || new Map<string, string>());

    let selectedReact = $state('All');
    

    //reacts is a map, we have to filter by the value of the map, not the key
    let reactsToShow = $derived(Array.from(reacts.entries()).filter(([_, react]) => selectedReact === 'All' || selectedReact === react));

    let reactsCount = $derived(Array.from(new Set(reacts.values())).reduce((acc, react) => {
        acc[react] = Array.from(reacts.values()).filter(r => r === react).length;
        return acc;
    }, {} as {[react: string]: number}));

    onDestroy(() => {
        selectedReact = 'All';
    });

</script>

<Modal show={$page.state.showReactsOnMessage}>
    <div class="reactsOnMessage box-shadow back-blur" transition:fly|global={{y: 40, duration: 100}}>
        <div class="title">Reacts on {$chatRoomStore.userList[message?.sender || '']?.avatar || "Zombie"}'s message</div>
        <div class="users">
            <!-- Slow selected type of reacts -->
            {#key reactsToShow}
            {#each reactsToShow as [uid, react], i}
                <div class="user">
                    <div class="userInfo" in:fly|global={{x: -5, delay: 50 * (i + 1)}}>
                        <img src="/images/avatars/{$chatRoomStore.userList[uid]?.avatar || "Rip"}(custom).png" alt="user"/>
                        <span>
                            {$chatRoomStore.userList[uid]?.avatar || "Zombie"}
                            {#if uid === myId.value}
                                (You)
                            {/if}
                        </span>
                    </div>
                    <span class="react-emoji" in:fly|global={{x: 5, delay: 50 * (i + 1)}}>{react}</span>
                </div>
                {/each}
            {/key}
        </div>
        <div class="totalReactsButtons" in:fly|global={{x: 20, duration: 150}}>
            <!-- Show which reacts appear how many times -->
            <label>
              <input type="radio" bind:group={selectedReact} value="All"/>
              <div class="item">
                All ({reacts.size})
              </div>
            </label>
            <div class="others">
                <!-- Show each unique react and their count -->
                {#key reactsCount}
                {#each Object.entries(reactsCount) as [react, count]}
                <label>
                  <input type="radio" bind:group={selectedReact} value={react}/>
                  <div class="item">
                    {react} ({count})
                  </div>
                </label>
                {/each}
                {/key}
            </div>
          </div>
    </div>
</Modal>

<style lang="scss">

    .totalReactsButtons{
        display: grid;
        grid-auto-flow: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: auto;
        width: 100%;

        .others{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            gap: 2px;
            overflow-x: scroll;
        }

        label{
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: flex-start;
            font-size: 0.7rem;
            text-align: center;
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
                    background: var(--glass-color);
                }
            }
            :global(.item *){
                pointer-events: none;
            }

            input{
                display: none;
            }

            input:checked + .item{
                background: var(--secondary-dark);
                font-weight: 700;
            }

        }
    }

    .reactsOnMessage{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        background: var(--modal-color);
        padding: 15px 10px 10px 10px;
        width: 300px;
        height: 350px;
        max-width: 98vw;
        border-radius: 15px;

        .title{
            color: var(--secondary-dark);
            margin-bottom: 10px;
        }

        .users{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            overflow-y: scroll;
            width: 100%;
            margin: 10px 0;
            gap: 10px;

            .user{
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: 5px;
                font-size: 0.8rem;

                .userInfo{
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                }

                img{
                    height: 25px;
                    width: 25px;
                    border-radius: 50%;
                }

                .react-emoji{
                    font-size: 1rem;
                    font-weight: 500;
                    color: var(--secondary-dark);
                }
            }
        }
    }
</style>