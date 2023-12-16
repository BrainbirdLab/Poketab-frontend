<script lang="ts">
    import {fly} from "svelte/transition";

    import {chatRoomStore, currentPage, joinedChat, selfInfoStore, splashMessage} from "$lib/store";
    import {clearModals, showQuickSettingsPanel, showSidePanel} from "./modalManager";
    import { showPopupMessage } from "./popup";
    import type { User } from "$lib/store";
    import { socket } from "./socket";
    import { messageDatabase } from "$lib/messages";

    let copyKeyIcon = 'fa-regular fa-clone';
    let copyTimeout: NodeJS.Timeout | null = null;


    socket.on('updateUserList', (users: {[key: string]: User}) => {
        chatRoomStore.update((chatRoom) => {
            chatRoom.userList = users
            return chatRoom;
        });
    });

    function copyKey(){
        navigator.clipboard.writeText($chatRoomStore.Key).then(() => {
            showPopupMessage('Copied to clipboard!');
            copyKeyIcon = 'fa-solid fa-check';
            if (copyTimeout) clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
                copyKeyIcon = 'fa-regular fa-clone';
            }, 1000);
        })
        .catch(err => {
            console.log(err);
            showPopupMessage('Failed to copy');
        });
    }

    function leaveChat(){
        console.log('Leaving chat...');
        splashMessage.set('Leaving Chat');
        clearModals();
        socket.emit('leaveChat', () => {
            console.log('Left chat');
            chatRoomStore.set({
                Key: '',
                userList: {},
                maxUsers: 2,
            });
            selfInfoStore.set({
                uid: '',
                name: '',
                avatar: '',
                lastSeenMessage: '',
            });
            messageDatabase.update(messages => {
                messages.clear();
                return messages;
            });
            joinedChat.set(false);
            currentPage.set('form');
            splashMessage.set('');
        });
    }

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

    $: KEY = $chatRoomStore.Key;

</script>

{#if $showSidePanel}
<div id="sidebarWrapper" transition:fly={{x:-30, duration: 100}} use:closeSideBar>
    <div id="sidebar">
        <div class="topbar">
            <button id="keyname" class="btn play-sound clickable" on:click={copyKey}><i class="{copyKeyIcon}"></i> {KEY}</button>
        </div>
        <ul id="userlist">
            <li class="user">
                <div class="avt">
                    <img src="/images/avatars/{$selfInfoStore.avatar}(custom).webp" height="30" width="30" alt="Profile-avatar">
                    <i class="fa-solid fa-circle activeStatus"></i>
                </div>
                <span>{$selfInfoStore.name} (You)</span>
            </li>
            {#each Object.entries($chatRoomStore.userList) as [id, User]}
                {#if User.uid != $selfInfoStore.uid}
                    <li class="user">
                        <div class="avt">
                            <img src="/images/avatars/{User.avatar}(custom).webp" height="30" width="30" alt="Profile-avatar">
                            <i class="fa-solid fa-circle activeStatus"></i>
                        </div>
                        <span>{User.name}</span>
                    </li>
                {/if}
            {/each}
        </ul>
        <div class="footer_options">
            <button on:click={()=> {showQuickSettingsPanel.set(true)}}><i class="fa-solid fa-gear settings hover button-animate small btn play-sound hoverShadow" title="Quick Settings [Alt+s]"></i></button>
            <button on:click={leaveChat} id="logoutButton" class="button hover button-animate small btn play-sound"><i class="fa-solid fa-arrow-right-from-bracket"></i><span>Leave</span></button>
        </div>
    </div>
</div>
{/if}


<style lang="scss">
    #sidebarWrapper {
        width: 100%;
        top: 0;
        height: 100%;
        position: fixed;
        display: flex;
        flex-direction: row;
        transition: 100ms ease-in-out;
        z-index: 60;
        backdrop-filter: brightness(0.8);

        #sidebar{
            padding: 10px 10px 0 10px;
            border-radius: 0 5px 5px 0;
            background: var(--primary-dark);
            backdrop-filter: blur(10px);
            z-index: 90;
            display: flex;
            width: 75%;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0 4px 5px black);

            #keyname {
                border-radius: 10px;
                font-weight: 300;
            }

            #keyname, #sidebar #keyname * {
                color: var(--secondary-dark) !important;
                padding: 5px;
                cursor: pointer;
                font-size: 1rem;
            }

            #userlist {
                overflow: scroll;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                height: 100%;
                width: 100%;
                padding: 10px;
                list-style: none;
                gap: 5px;
                border-radius: 10px;
                scrollbar-width: none;

                .user {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    font-weight: 900;

                    .avt {
                        position: relative;
                        background: var(--option-color);
                        border-radius: 50%;

                        img{
                            display: block;
                        }
                        .activeStatus {
                            position: absolute;
                            bottom: 0;
                            right: 0;
                            font-size: 0.5rem;
                            color: lime;
                        }
                    }
                }
            }

            .footer_options {
                display: flex;
                flex-direction: row;
                width: 100%;
                padding: 10px 0;
                align-items: center;
                justify-content: space-between;

                .fa-gear {
                    font-size: 1.5rem;
                    cursor: pointer;
                }

                #logoutButton {
                    background: red;
                    font-size: 0.8rem;
                    color: inherit;
                }

                .settings:hover {
                    transform: rotate(45deg);
                }
            }
        }
    }

    #sidebarWrapper #sidebar{
        position: relative;
    }

    @media screen and (orientation: landscape) {
    //width 2x height
    @media screen and (min-device-aspect-ratio: 1.5 / 1) {

        #sidebarWrapper {
            #sidebar {
                width: 25%;
            }
        }
    }

    //width 1.5x height
    @media screen and (min-device-aspect-ratio: 1.2 / 1) and (max-device-aspect-ratio: 1.5 / 1) {

        #sidebarWrapper {
            #sidebar {
                width: 35%;
            }
        }
    }

    //same
    @media screen and (min-device-aspect-ratio: 1 / 1) and (max-device-aspect-ratio: 1.2 / 1) {

        #sidebarWrapper {
            #sidebar {
                width: 50%;
            }
        }
    }
}

</style>