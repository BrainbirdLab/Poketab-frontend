<script>
    import { userTypingString } from "$lib/store";
    import { fly } from "svelte/transition";

</script>

{#if $userTypingString}
<div class="indicatorWrapper">
    <div id="typingIndicator" transition:fly={{y: 5, duration: 100}}>
        <div class="text">{$userTypingString}</div>
        <div class="bubble">
            <div class="dot bouncing" />
            <div class="dot bouncing" />
            <div class="dot bouncing" />
        </div>
    </div>
</div>
{/if}

<style lang="scss">

    .indicatorWrapper{
        position: relative;
        width: 100%;
    }

    #typingIndicator {
        position: absolute;
        bottom: 0px;
        padding-left: 10px;
        padding-bottom: 2px;
        font-size: 0.8rem;
        height: 20px;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        transition: 100ms ease-in-out;

        .text {
            color: rgba(255, 255, 255, 0.5);
        }

        .bubble {
            position: relative;
            display: flex;
            flex-direction: row;
            align-items: flex-end;
            gap: 2px;
            padding: 5px;
            border-radius: 10px;
            font-size: 0.7rem;
            .dot {
                position: relative;
                width: 3px;
                height: 3px;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
            }
            .bouncing {
                animation: bouncing 1s infinite;
                @for $i from 0 through 2 {
                    &:nth-child(#{$i + 1}) {
                        animation-delay: 0.2 * $i + s;
                    }
                }
            }
        }

        .text:empty + .bubble {
            display: none;
        }
    }
</style>
