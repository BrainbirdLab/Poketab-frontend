<script lang="ts">
    import { selectedFiles } from "$lib/messageStore.svelte";
    import { onMount, onDestroy } from "svelte";
    import { fade } from "svelte/transition";

    interface Props {
        sendAsType: "file" | "image" | "audio";
    }

    let { sendAsType = $bindable() }: Props = $props();

    let isFileDragging = $state(false);
    let isFileOnDropTarget = $state(false);

    let dropZone = $state() as HTMLElement;

    onMount(() => {
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("drop", handleDrop);
    });

    onDestroy(() => {
        window.removeEventListener("dragover", handleDragOver);
        window.removeEventListener("drop", handleDrop);
    });

    let dragtimer: number | NodeJS.Timeout;

    function handleDragOver(e: DragEvent) {
        e.stopPropagation();
        e.preventDefault();
        isFileDragging = true;

        if (e.target == dropZone) {
            isFileOnDropTarget = true;
        } else {
            isFileOnDropTarget = false;
        }

        clearTimeout(dragtimer);

        dragtimer = setTimeout(() => {
            isFileDragging = false;
        }, 200);
    }

    function handleDrop(e: DragEvent) {

        e.preventDefault();

        if (e.target != dropZone){
            return;
        }

        if (e.dataTransfer == null) {
            return;
        }

        if (e.dataTransfer.files.length > 0) {
            const files = e.dataTransfer.files;
            if (Array.from(files).every(file => file.type.startsWith('image/'))) {
                sendAsType = 'image';
            } else if (Array.from(files).every(file => file.type.startsWith('audio/'))){
                sendAsType = 'audio';
            } else {
                sendAsType = 'file';
            }
            selectedFiles.value = e.dataTransfer.files;
        }
    }

</script>

{#if isFileDragging}
<div class="fileDragArea" in:fade={{duration: 200}}>
    <div class="dropZone" bind:this={dropZone} class:active={isFileOnDropTarget}>
        <span>
            {#if isFileOnDropTarget}
                Release to attach File(s)
            {:else}
                Drop file(s) here
            {/if}
        </span>
    </div>
</div>
{/if}

<style lang="scss">
    .fileDragArea {
        position: fixed;
        display: flex;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.65);
        z-index: 100;
        align-items: center;
        justify-content: center;

        .dropZone {
            border: 5px dashed;
            padding: 60px;
            border-radius: 15px;
            justify-content: center;
            transition: 200ms ease-in-out;
            text-align: center;

            color: var(--text-color);

            &.active {
                color: var(--secondary-dark);
                padding: 80px;
            }

            > * {
                color: inherit;
                pointer-events: none;
            }
        }
    }
</style>
