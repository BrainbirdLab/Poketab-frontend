<script lang="ts">
    import { bufferToHexCode, exportPublicKey } from "$lib/e2e/encryption";
    import { chatRoomStore, myId } from "$lib/store";
    import { slide } from "svelte/transition";

    export let avatar: string;
    export let uid: string;
    export let showId: string;

    let key: string;

    $: {
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
    }
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
        <span
            >{avatar}
            {#if uid == $myId}
                (You)
            {/if}</span
        >
    </div>
    <div class="e2eKey" title="View public key" data-uid={uid}>
        <i class="fa-solid fa-eye{key ? "" : "-slash"}"></i>
    </div>
</div>
{#if key} 
<div class="key user-select monospace" transition:slide>
    <div class="info">
        Used to encrypt messages for this user
    </div>
    <div class="hash">
        {key}
    </div>
</div>
{/if}

<style lang="scss">

    .wrapper {
        display: flex;
        flex-direction: row;
        width: 100%;
    }

    .key {
        font-size: 0.7rem;
        .info{
            color: var(--secondary-dark);
        }
        .hash{
            color: var(--transparent-white-color);
            max-height: 128px;
            overflow: scroll;
        }
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
