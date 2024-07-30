<script lang="ts">
    import { page } from "$app/stores";
    import { chatRoomStore } from "$lib/store";
    import { fade, fly } from "svelte/transition";
    import { addState } from "../stateManager.svelte";
    import { onMount } from "svelte";
    import { writable } from "svelte/store";

    export let encrypted = false;

    const textToScrambleInitial = "Encrypting this chat";
    const textToScrambleFinal = "End-to-end encrypted";
    const scrambledText = writable(textToScrambleInitial);

    const randomChars = "ABCDEFGH**IJKLMNOPQRST**UVWXYZabcdefghij**klmnopqrstuvw**xyz0123456**789";

    function* scrambleText(input: string) {
        let text = input.split("");

        function getRandomInt(max: number) {
            return Math.floor(Math.random() * max);
        }

        while (true) {
            const index = getRandomInt(text.length);
            text[index] = randomChars[getRandomInt(randomChars.length)];
            yield text.join("");
        }
    }

    let interval: number;

    function startScrambleAnimation(initialText: string) {
        const generator = scrambleText(initialText);
        interval = setInterval(() => {
            const result = generator.next();
            if (!result.done && result.value) {
                scrambledText.set(result.value);
            }
        }, 100); // Adjust the interval time as needed for the animation effect
    }

    onMount(() => {
        console.log("mounted");
        startScrambleAnimation(textToScrambleInitial);
    });

    $: if (encrypted) {
        clearInterval(interval);
        scrambledText.set(textToScrambleFinal);
    }
</script>

<div class="navbar" transition:fly={{ y: -50 }}>
    <div class="currentlyActive">
        <div class="users">
            <i class="fa-solid fa-user"></i> Active: {Object.keys(
                $chatRoomStore.userList,
            ).length}/{$chatRoomStore.maxUsers}
        </div>
        <div class="enc">
            {#if encrypted}
                <i class="fa-solid fa-lock"></i>
            {:else}
                <i class="fa-solid fa-lock-open"></i>
            {/if}
            {$scrambledText}
        </div>
    </div>
    <div class="optionPanel">
        {#if !$page.state.showQuickSettingsPanel}
            <button
                transition:fade={{ duration: 100 }}
                class="button-animate hover roundedBtn play-sound hoverShadow"
                title="Customize chat"
                on:click={() => {
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
