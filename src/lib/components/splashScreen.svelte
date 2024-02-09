<script>
    import { currentPage, splashButtonText, splashMessage } from "$lib/store";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";

    let mounted = false;

    onMount(() => {
        mounted = true;
    });

    function closeSplashScreen() {
        splashMessage.set('');
        splashButtonText.set('');
        currentPage.set('form');
    }

</script>

{#if mounted && $splashMessage}
    <div class="container" class:bg={!$splashButtonText} out:fly={{x: 20}}>
        <div class="text">{@html $splashMessage}</div>
        {#if $splashButtonText}
            <button class="button-animate hover btn play-sound" on:click={closeSplashScreen}>{$splashButtonText}</button>
        {/if}
    </div>
{/if}

<style lang="scss">
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 40px;
        color: var(--secondary-dark);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: #17191d;

        &.bg{
            background-image: url('/images/strike.gif');
            background-size: 40%;
            background-repeat: no-repeat;
            background-position: center;
        }
        
        z-index: 1000;
        font-size: 1rem;

        button{
            background: var(--secondary-dark, #4598ff);
            color: white;
            cursor: pointer;
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            gap: 5px;
            border: none;
            outline: none;
            border-radius: 10px;
            padding: 10px 15px;
        }
    }
</style>