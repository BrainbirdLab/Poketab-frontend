<script lang="ts">
    import { fly, scale } from "svelte/transition";

    export let title: {text: string, icon: string};
</script>

<div class="titleBar">
    <img src="/images/pikachu-mini.png" alt="Logo" in:scale>
    <div class="text">
        <div class="headingText" in:fly={{x: 20}}>Poketab | {title.text} <i class="{title.icon}"></i></div>
        <div class="subHeadingText" in:fly={{y: 5, delay: 130}}>The cutest realtime chat app ever.</div>
    </div>
</div>

<style lang="scss">
    .titleBar{
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding-top: 35px;
        width: 100%;

        img{
            width: 35px;
            height: 35px;
        }

        .text{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            .headingText{
                font-size: 1rem;
                font-weight: bold;
                color: var(--text-color);
            }
        }
        .subHeadingText{
            font-size: 0.6rem;
            color: var(--text-color);
            opacity: 0.5;
        }
    }

    i{
        font-size: 1rem;
        color: var(--secondary-dark);
    }
</style>