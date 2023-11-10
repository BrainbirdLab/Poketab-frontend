<script lang="ts">

    import { chatRoomStore } from "$lib/store";
    import { showSidePanel } from "./modalManager";
    import { fly } from "svelte/transition";

</script>

<div class="navbar" transition:fly={{y: -50}}>
    <div id="currentlyActive"><i class="fa-solid fa-user"></i> Active: {Object.keys($chatRoomStore.userList).length}/{$chatRoomStore.maxUsers}</div>
    <div class="optionPanel">                
        <button id="more" class="button-animate btn hover roundedBtn play-sound hoverShadow" title="Active users and Settings [Alt+o]" on:click={()=>{console.log('Showing side panel'); showSidePanel.set(true)}}>
            <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
    </div>
</div>


<style lang="scss">
    .navbar {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        //position: absolute;
        position: relative;
        top: 0;
        width: 100%;
        z-index: 15;
        font-size: 0.9rem;
        padding: 5px;
        color: var(--foreground-dark);
        //background: var(--primary-dark);
        //filter: drop-shadow(0 4px 5px black);
        i {
            color: inherit;
            font-size: 0.9rem;
            color: var(--foreground-dark);
        }
        #currentlyActive {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 10px;
        }
    }
</style>