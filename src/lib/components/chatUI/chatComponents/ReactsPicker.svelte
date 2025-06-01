<script lang="ts">
    import { fly } from 'svelte/transition';
    import { spin } from '$lib/utils';
    import EmojiPicker from '$lib/components/chatUI/chatComponents/emojiPicker.svelte';
    import { page } from "$app/state";
    import { reactArray, myId } from "$lib/store.svelte";

    interface ReactsPickerProps {
        message: { reactedBy: Map<string, string> };
        selectedReact?: string;
        reactIsExpanded: boolean;
    }

    let { message, selectedReact = $bindable(), reactIsExpanded = $bindable() }: ReactsPickerProps = $props();

    let reactedEmoji = $derived(message?.reactedBy.get(myId.value) || '');

</script>


<div class="reactionsChooser box-shadow back-blur" transition:fly|global={{y: -10, duration: 200}}>
    {#if reactIsExpanded}
        <EmojiPicker selectedEmoji={selectedReact} exclude={[...reactArray.value.last, ...reactArray.value.reacts]} onClose={()=>{
            reactIsExpanded = false;
        }}/>
    {/if}
    <div class="primary">
        {#each reactArray.value.reacts as react}
            <div class:shown={page.state.showMessageOptions} class="reactContainer roundedBtn" class:selected={reactedEmoji == react}>
                <div class="emoji" data-emoji="{react}">{react}</div>
            </div>
        {/each}
        
        <!-- Show reactedEmoji as last react if has, else show reactArray.value.last as last -->
        {#if reactedEmoji && !reactArray.value.reacts.includes(reactedEmoji)}
            <div class="reactContainer roundedBtn" class:selected={true}>
                <div class="emoji" data-emoji="{reactedEmoji}">{reactedEmoji}</div>
            </div>
        {:else}
            <div class="reactContainer roundedBtn" class:selected={selectedReact == reactArray.value.last}>
                <div class="emoji" data-emoji="{reactArray.value.last}">{reactArray.value.last}</div>
            </div>
        {/if}

        {#if !reactIsExpanded}
            <button aria-label="more" in:spin={{duration: 250, degree: 180}} class="more roundedBtn" title="More" onclick={()=>{reactIsExpanded = true}}><i class="fa-solid fa-caret-up"></i></button>
        {:else}
            <button aria-label="more" in:spin={{duration: 250, degree: 180}} class="more roundedBtn" title="Less" onclick={()=>{reactIsExpanded = false}}><i class="fa-solid fa-caret-down"></i></button>
        {/if}
    </div>
</div>

<style lang="scss">
    .reactionsChooser{
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 5px;
        transition: all 100ms ease-in-out;
        max-width: min(300px, 95vw);
        background: var(--modal-color);
        border-radius: 23px;
        padding: 5px;
    }

    .reactContainer.selected{
        background: var(--secondary-dark);
    }

    .reactContainer{
        transition: all 100ms ease-in-out;
        transform-origin: bottom;
        font-size: 1.5rem;
        animation: bubbleUp 500ms ease-in-out forwards;
        opacity: 0;
        //add animation delay of 50ms for each emoji
        @for $i from 0 through 6 {
            &:nth-of-type(#{$i + 1}) {
                animation-delay: #{($i * 50)}ms !important;
            }
        }
    }
    
    .primary{
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: 1.4px;
        transition: 200ms ease-in-out;

        .more{
            background: #ffffff15;
            &:hover{
                background: #ffffff10;
            }
        }
    }

    @keyframes bubbleUp {
        0% {
            opacity: 0;
            transform: scale(0);
        }
        25% {
            opacity: 0.5;
            transform: scale(1.3);
        }
        50% {
            opacity: 1;
            transform: scale(0.8);
        }
        100% {
            opacity: 1;
            transform: scale(1);
        }
    }
</style>