<script lang="ts">
    import { slide } from "svelte/transition";
    import { emojis } from "$lib/utils";
    import { elasticOut } from "svelte/easing";


    interface Props {
        selectedEmoji?: string;
        height?: string;
        showClose?: boolean;
        exclude?: string[];
        onClose: () => void;
    }

    let {
        selectedEmoji = $bindable(''),
        height = "42vh",
        showClose = false,
        exclude = [],
        onClose
    }: Props = $props();

    function handleClick(node: HTMLElement){
        node.onclick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.classList.contains('down')){
                onClose();
            } else if (target.classList.contains('emoji')) {
                selectedEmoji = target.dataset.emoji as string || '';
                onClose();
            }
        }

        return {
            destroy(){
                node.onclick = null;
            }
        }
    }

</script>

<div class="emojiPicker" style="height: {height};" in:slide={{duration: 600, easing: elasticOut}} out:slide={{duration: 100}} use:handleClick>
    {#if showClose}
    <button class="down" aria-label="close">
        <i class="fa-solid fa-chevron-down"></i>
    </button>
    {/if}
    <div class="emojis">
        {#each emojis as emoji}
            {#if !exclude.includes(emoji)}
            <div class="reactContainer roundedBtn" class:selected={emoji == selectedEmoji}>
                <div class="emoji" data-emoji="{emoji}">{emoji}</div>
            </div>
            {/if}
        {/each}
    </div>
</div>

<style lang="scss">

    .down{
        padding-bottom: 5px;
        margin-top: -5px;
        width: 100%;
        text-align: center;
        font-size: 1.2rem;
        color: var(--secondary-dark);
        border-bottom: 2px solid var(--glass-color);
        i{
            pointer-events: none;
        }
    }

    .emojiPicker{
        position: relative;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        overflow: visible;
        border-radius: inherit;
        font-size: 1.5rem;
        padding: 5px 0;
        border-radius: 10px;
        
        .emojis{
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            flex-wrap: wrap;
            height: 100%;
            overflow-y: scroll;
        }
    }
</style>