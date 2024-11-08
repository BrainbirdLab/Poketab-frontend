<script lang="ts">

    import { bufferToHexCode, exportPublicKey } from "$lib/e2e/encryption";
    import { chatRoomStore, myId } from "$lib/store.svelte";
    import { slide } from "svelte/transition";

    interface Props {
        avatar: string;
        uid: string;
        showId: string;
    }

    let { avatar, uid, showId }: Props = $props();

    let key = $state('');

    $effect.pre(() => {
        if (showId == uid) {
            const publicKey = $chatRoomStore.userList[uid].publicKey;
            if (publicKey) {
                // convert it to 2 digit hex string separated by 1 space. like d2 4b a9
                exportPublicKey(publicKey).then((exportedKey) => {
                    key = bufferToHexCode(exportedKey);
                });
            }
        } else {
            key = '';
        }
    });
</script>

<div class="wrapper">
    <div class="userInfo">
        <div class="avt">
            <img
                src="/images/avatars/{avatar}(custom).webp"
                height="30"
                width="30"
                alt={avatar}
            />
        </div>
        <div
            >{avatar}
            {#if uid == myId.value}
                (You)
            {/if}
            {#if key}
            <div class="moreInfo" transition:slide={{duration: 150}}>
                Encryption key
            </div>
            {/if}
        </div>
    </div>
    <div class="e2eKey" title="View public key" data-uid={uid}>
        <i class="fa-solid fa-chevron-right {key ? "active" : ""}"></i>
    </div>
</div>
{#if key} 
<div class="key upper user-select monospace" transition:slide={{duration: 150}}>
    {key}
</div>
{/if}

<style lang="scss">

    .fa-chevron-right{
        transition: 100ms;
        &:not(.active):hover{
            transform: translateX(2px);
        }
        &.active{
            transform: rotate(90deg);
        }
    }

    .moreInfo{
        font-size: 0.7rem;
        color: var(--transparent-white-color);
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        text-align: left;
        gap: 5px;
    }

    .wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
    }

    .key {
        font-size: 0.7rem;
        color: var(--transparent-white-color);
        max-height: 128px;
        overflow: scroll;
    }

    .userInfo {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 5px;
        width: 100%;
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
        &:hover {
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
</style>
