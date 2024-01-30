<script lang="ts">
    import {fly} from "svelte/transition";

    import {chatRoomStore, myId} from "$lib/store";
    import {showSidePanel} from "$lib/components/modalManager";
    import { flip } from "svelte/animate";


    function closeSideBar(node: HTMLElement){

        const method = (e: Event) => {
            if (e.target === node) {
                showSidePanel.set(false);
            }
        }

        node.onclick = method;

        return {
            destroy(){
                node.onclick = null;
            }
        }
    }

</script>

<div id="sidebarWrapper" transition:fly={{x: -10, duration: 100}} use:closeSideBar>
    <div id="sidebar">
        <ul id="userlist">
            <div class="title"><i class="fa-solid fa-user-group"></i> Peoples on this chat</div>
            <div class="users">
                <li class="user" in:fly|global={{y: 10, duration: 150, delay: 50}}>
                    <div class="avt">
                        <img src="/images/avatars/{$chatRoomStore.userList[$myId].avatar}(custom).webp" height="30" width="30" alt="Profile-avatar">
                    </div>
                    <span>{$chatRoomStore.userList[$myId].name} (You)</span>
                </li>
                {#each Object.entries($chatRoomStore.userList).filter(([id, _]) => id !== $myId) as [id, User], i (id)}
                    <li class="user" in:fly|global={{y: 10, duration: 150, delay: 50 * (i + 2)}} out:fly={{x: -20, duration: 100}} animate:flip={{duration: 100}}>
                        <div class="avt">
                            <img src="/images/avatars/{User.avatar}(custom).webp" height="30" width="30" alt="Profile-avatar">
                        </div>
                        <span>{User.name}</span>
                    </li>
                {/each}
            </div>
        </ul>
    </div>
</div>

<style lang="scss">

    #sidebarWrapper {
        width: 100%;
        top: 0;
        height: 100%;
        position: fixed;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        z-index: 60;
        backdrop-filter: brightness(0.8);

        #sidebar{
            padding: 10px;
            border-radius: 10px;
            background: var(--primary-dark);
            backdrop-filter: blur(10px);
            display: flex;
            max-width: 75vw;
            width: 300px;
            height: max-content;
            max-height: min(400px, 75vh);
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            filter: drop-shadow(0 4px 5px var(--shadow));
            position: relative;


            #userlist {
                overflow: scroll;
                display: flex;
                flex-direction: column;
                width: 100%;
                align-items: flex-start;
                justify-content: flex-start;

                .title{
                    width: 100%;
                    padding: 10px 5px 3px;
                    font-size: 0.9rem;
                    i{
                        font-size: inherit;
                    }
                    //border-bottom: 2px solid var(--glass);
                }

                .users{
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
                        background: var(--option-color);
                        border-radius: 50%;

                        img{
                            display: block;
                            height: 30px;
                            width: 30px;
                            aspect-ratio: 1/1;
                        }
                    }
                }
            }
        }
    }

    #sidebarWrapper #sidebar{
        position: relative;
    }

</style>