<script lang="ts">
    import type { ImageMessageObj } from "$lib/messageTypes";
    import { myId } from "$lib/store";

    export let file: ImageMessageObj;
</script>

<img
    class="image"
    src={file.url}
    alt={file.name}
    height={file.height}
    width={file.width}
    style={file.sender === $myId
        ? ""
        : file.loaded < 100
          ? "filter: blur(10px); transform: scale(1.1); transition: 500ms ease-in-out;"
          : ""}
/>
{#if file.loaded >= 100}
    <div
        class="imageProgressCircle"
        style="stroke-dasharray: {(file.loaded * 251.2) / 100}, 251.2;"
    >
        <svg viewBox="0 0 100 100">
            {#if file.loaded > 0}
                <circle cx="50" cy="50" r="45" fill="transparent" />
                <path
                    stroke-linecap="round"
                    stroke-width="3"
                    stroke="#fff"
                    fill="none"
                    d="M50 10
            a 40 40 0 0 1 0 80
            a 40 40 0 0 1 0 -80"
                >
                </path>
            {/if}
        </svg>
        <div class="progress">
            {#if file.loadScheme == "upload"}
                <i class="fa-solid fa-arrow-up"></i>
                {file.sender === $myId ? `${file.loaded}%` : "Sending"}
            {:else if file.loadScheme == "download"}
                <i class="fa-solid fa-arrow-down"></i>
                {file.loaded}%
            {/if}
        </div>
    </div>
{/if}

<style lang="scss">
    
    .image {
        max-width: 100%;
        max-height: 100%;
        min-height: 100px;
        min-width: 100px;
        height: auto;
        object-fit: contain;
    }

    .imageProgressCircle {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 100%;
        height: 100%;
        transform: translate(-50%, -50%);
        color: white;
        display: grid;
        place-items: center;
        background: rgba(0, 0, 0, 0.5);
        z-index: 12;

        svg {
            width: 65px;
            border-radius: 50%;
            background: rgba(0, 0, 0, 0.15);
        }

        .progress {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }
</style>
