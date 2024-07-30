<script lang="ts">
    import { page } from "$app/stores";
    import { exportPublicKey } from "$lib/e2e/encryption";
    import { chatRoomStore } from "$lib/store";
    import { fly } from "svelte/transition";
    import Modal from "./modal.svelte";

    const uid = $page.state.showPublicKeysOf;

    let key: string;

    if (uid) {
        const publicKey = $chatRoomStore.userList[uid].publicKey;
        if (publicKey) {
            // convert it to 2 digit hex string separated by 1 space. like d2 4b a9
            exportPublicKey(publicKey).then((exportedKey) => {
                key = new Uint8Array(exportedKey).reduce((str, byte) => str + byte.toString(16).padStart(2, "0") + " ", "");
            });
        } else {
            console.log("No public key found");
        }
    }
</script>

<Modal show={$page.state.showPublicKeysOf != ''}>
    {#if uid && key}
    <div class="keysContainer back-blur box-shadow" transition:fly={{ y: 20, duration: 100 }}>
        <div class="title">
            Public key of {$chatRoomStore.userList[uid]?.avatar || "Zombie"} <i class="fa-solid fa-key"></i>
        </div>
        <div class="key">
            {key}
        </div>
    </div>
    {/if}
</Modal>

<style lang="scss">
    .title{
        font-size: 0.7rem;
        padding-bottom: 5px;
        color: var(--secondary-dark);
        * {
            color: inherit;
            font-size: inherit;
        }
    }
    .keysContainer{
        background: var(--modal-color);
        border-radius: 10px;
        width: min(95vw, 500px);
        padding: 10px;
    }
    .key{
        font-size: 0.7rem;
        color: var(--transparent-white-color);
        text-align: justify;
        font-family: monospace;
        max-height: 300px;
        overflow: scroll;
        user-select: text;
    }
</style>