<script lang="ts">
    import { chatRoomStore } from "$lib/store";
    import { eventTriggerMessageId, type MessageObj, messageDatabase } from "$lib/messageTypes";
    import { showReactsOnMessageModal } from "$lib/modalManager";
    import { fly } from "svelte/transition";
    import { derived } from "svelte/store";

    $: message = derived(messageDatabase, (messages) => {
        return messages[messageDatabase.getIndex($eventTriggerMessageId)] as MessageObj;
    });

    // [uid: string]: react-emoji
    $: reacts = $message?.reactedBy || new Map<string, string>();

    $: selectedReact = 'All';

    //$: reactsToShow = Object.entries(reacts).filter(([uid, react]) => selectedReact === 'All' || selectedReact === react);
    //reacts is a map, we have to filter by the value of the map, not the key
    $: reactsToShow = Array.from(reacts.entries()).filter(([_, react]) => selectedReact === 'All' || selectedReact === react);

    //push react - count to map
    // [react-emoji: string]: count: number
    /*$: reactsCount = Array.from(new Set(Object.values(reacts))).reduce((acc, react) => {
        acc[react] = Object.values(reacts).filter(r => r === react).length;
        return acc;
    }, {} as {[react: string]: number});
    */

    $: reactsCount = Array.from(new Set(reacts.values())).reduce((acc, react) => {
        acc[react] = Array.from(reacts.values()).filter(r => r === react).length;
        return acc;
    }, {} as {[react: string]: number});

    function handleClick(node: HTMLElement) {
        node.onclick = (e) => {
            const target = e.target as HTMLElement;

            if (target == node){
                eventTriggerMessageId.set("");
                selectedReact = 'All';
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

<div class="wrapper" use:handleClick transition:fly|global={{y: 40, duration: 100}}>
    <div class="reactsOnMessage back-blur">
        <div class="title">Reacts on {$chatRoomStore.userList[$message?.sender || '']?.avatar || "Zombie"}'s message</div>
        <div class="users">
            <!-- Slow selected type of reacts -->
            {#key reactsToShow}
            {#each reactsToShow as [uid, react], i}
                <div class="user">
                    <div class="userInfo" in:fly|global={{x: -5, delay: 50 * (i + 1)}}>
                        <img src="/images/avatars/{$chatRoomStore.userList[uid]?.avatar || "Rip"}(custom).png" alt="user"/>
                        <span>{$chatRoomStore.userList[uid]?.avatar || "Zombie"}</span>
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
</div>

<style lang="scss">

    .wrapper{
        position: fixed;
        inset: 0;
        z-index: 50;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        gap: 10px;
        z-index: 100;
    }

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
                * {
                    pointer-events: none;
                }
                &:hover{
                    background: var(--glass-color);
                }
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
        box-shadow: 10px 10px 35px var(--shadow-color);

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