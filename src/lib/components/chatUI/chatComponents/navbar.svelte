<script lang="ts">

    import { page } from "$app/stores";
    import { chatRoomStore } from "$lib/store.svelte";
    import { fade, scale } from "svelte/transition";
    import { addState } from "../stateManager.svelte";
    import { onMount } from "svelte";
    import { startScrambleAnimation, stopScrambleAnimation } from "$lib/scrambler.svelte";
    import { ref } from '$lib/ref.svelte';

    interface Props {
        encrypted?: boolean;
    }

    let { encrypted = $bindable(false) }: Props = $props();

    const textToScrambleInitial = "Encrypting this chat";
    const textToScrambleFinal = "End-to-end encrypted";
    const scrambledText = ref(textToScrambleInitial);

    onMount(() => {
        startScrambleAnimation(textToScrambleInitial, scrambledText);
    });

    $effect(() => {
        if (encrypted) {
            stopScrambleAnimation();
            scrambledText.value = textToScrambleFinal;
        }
    });
</script>

<div class="navbar" transition:scale={{ start: 1.3 }}>
    <div class="currentlyActive">
        <div class="users">
            <i class="fa-solid fa-user"></i> Active: {Object.keys(
                chatRoomStore.value.userList,
            ).length}/{chatRoomStore.value.maxUsers}
        </div>
        <div class="enc">
            {#if encrypted}
                <i class="fa-solid fa-lock"></i>
            {:else}
                <i class="fa-solid fa-lock-open"></i>
            {/if}
            {scrambledText.value}
        </div>
    </div>
    <div class="optionPanel">
        {#if !$page.state.showQuickSettingsPanel}
            <button
                aria-label="Customize chat"
                transition:fade={{ duration: 100 }}
                class="button-animate hover roundedBtn play-sound hoverShadow"
                title="Customize chat"
                onclick={() => {
                    addState("quickSettings", { showQuickSettingsPanel: true });
                }}
            >
                <i class="fa-solid fa-ellipsis-vertical"></i>
            </button>
        {/if}
    </div>
</div>

<style lang="scss">
    .navbar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        position: relative;
        //top: 0;
        width: 100%;
        z-index: 15;
        font-size: 0.9rem;
        padding: 5px;
        color: var(--text-color);

        &::after {
            content: "";
            height: 1px;
            width: 120%;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(
                90deg,
                transparent,
                var(--glass-color),
                transparent
            );
        }

        i {
            color: inherit;
            font-size: 0.9rem;
            color: var(--text-color);
        }
        .currentlyActive {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 5px;
            padding: 10px 10px 0;

            .users {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 5px;
            }

            .enc {
                display: flex;
                flex-direction: row;
                align-items: center;
                gap: 5px;
                font-size: 0.6rem;
                color: var(--secondary-dark);
                i {
                    font-size: inherit;
                    color: inherit;
                }
            }
        }
    }
</style>
