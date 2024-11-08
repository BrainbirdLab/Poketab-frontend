<script lang="ts">
    import { clearModals } from "../stateManager.svelte";


    interface Props {
        show: boolean | undefined;
        children?: import('svelte').Snippet;
    }

    let { show, children }: Props = $props();

    function handle(node: HTMLElement) {
        node.onclick = (e: Event) => {
            if (e.target == node) {
                clearModals();
            }
        };
        return {
            destroy() {
                node.onclick = null;
            },
        };
    }

</script>

{#if show}
<div class="modal" use:handle>
    {@render children?.()}
</div>
{/if}

<style lang="scss">
    .modal {
        width: 100vw;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 55;
        transition: 100ms ease-in-out;
    }
</style>