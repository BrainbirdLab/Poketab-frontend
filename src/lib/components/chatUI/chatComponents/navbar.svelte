<script lang="ts">
    import { chatRoomStore } from "$lib/store";
    import { showQuickSettingsPanel, showSidePanel } from "$lib/components/modalManager";
    import { fly } from "svelte/transition";
</script>

<div class="navbar" transition:fly={{y: -50}}>
    <button on:click={() => {showSidePanel.set(true)}} class="currentlyActive"><i class="fa-solid fa-user"></i> Active: {Object.keys($chatRoomStore.userList).length}/{$chatRoomStore.maxUsers}</button>
    <div class="optionPanel">                
        <button class="button-animate btn hover roundedBtn play-sound hoverShadow" title="Customize chat" on:click={()=>{showQuickSettingsPanel.set(true)}}>
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
        i {
            color: inherit;
            font-size: 0.9rem;
            color: var(--foreground-dark);
        }
        .currentlyActive {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 5px;
            padding: 10px;
        }
    }
</style>