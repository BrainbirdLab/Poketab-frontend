<script lang="ts">
    import { selectedFiles } from "$lib/messageTypes";
    import { onMount, onDestroy } from "svelte";
    import { fade } from "svelte/transition";
    import { showFilePicker, sendAsType } from "./attachments.svelte";

    let isFileDragging = false;
    let isFileOnDropTarget = false;

    let dropZone: HTMLElement;

    onMount(() => {
        window.addEventListener("dragover", handleDragOver);
        window.addEventListener("drop", handleDrop);
    });

    onDestroy(() => {
        window.removeEventListener("dragover", handleDragOver);
        window.removeEventListener("drop", handleDrop);
    });

    let dragtimer = 0;

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
            showFilePicker.set(true);
            const files = e.dataTransfer.files;
            if (Array.from(files).every(file => file.type.startsWith('image/'))) {
                sendAsType.set('image');
            } else if (Array.from(files).every(file => file.type.startsWith('audio/'))){
                sendAsType.set('audio');
            } else {
                sendAsType.set('file');
            }
            $selectedFiles = e.dataTransfer.files;
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
