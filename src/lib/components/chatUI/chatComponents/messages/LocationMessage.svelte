<script lang="ts">
    import type { LocationMessageObj } from "$lib/messageStore.svelte";
    import { chatRoomStore } from "$lib/store.svelte";

    interface Props {
        location: LocationMessageObj;
    }

    let { location }: Props = $props();

</script>

<a class="mapContainer" id={location.id} href={`https://maps.google.com/maps?q=${location.lat},${location.lon}`} target="_blank">
    <div class="title">
        <div class="icon"><i class="fa-solid fa-location-dot"></i></div>
        <div class="text">{chatRoomStore.value.userList[location.uid]?.avatar}'s Location</div>
    </div>
</a>

<style lang="scss">
    .mapContainer {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        color: var(--secondary-dark);
        border-radius: 10px;
        padding: 0.5rem;
        margin: 0.5rem 0;
        text-decoration: none;
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
        color: var(--secondary-dark);
        &::after {
            content: "\f08e";
            font-family: "FontAwesome";
            font-size: 0.8rem;
            padding: 0 5px;
        }
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