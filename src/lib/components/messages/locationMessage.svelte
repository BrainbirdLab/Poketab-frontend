<script lang="ts">
    import { chatRoomStore } from "$lib/store";

    export let id: string;
    export let lat: number;
    export let lon: number;
    export let uid: string;
</script>

<a class="mapContainer" id={id} href={`https://maps.google.com/maps?q=${lat},${lon}`} target="_blank">
    <div class="title">
        <div class="icon"><i class="fa-solid fa-location-dot"></i></div>
        <div class="text">{$chatRoomStore.userList[uid].name}'s Location</div>
    </div>
</a>

<style>
    .mapContainer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        color: var(--secondary-dark);
        border-radius: 10px;
        padding: 0.5rem;
        margin: 0.5rem 0;
    }

    .title{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }

    .mapContainer .icon i{
        font-size: 2rem;
        animation: rotate 2s linear infinite;
    }

    .mapContainer .text {
        font-size: 0.8rem;
    }

    @keyframes rotate {
        0% {
            transform: rotateY(0deg);
        }

        100% {
            transform: rotateY(360deg);
        }
    }
</style>