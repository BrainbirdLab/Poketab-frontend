<script lang="ts">
    import { pushState } from "$app/navigation";
    import { page } from "$app/stores";
    import { chatRoomStore } from "$lib/store";
    //import { showQuickSettingsPanel } from "$lib/components/modalManager";
    import { fade, fly } from "svelte/transition";
</script>

<div class="navbar" transition:fly={{y: -50}}>
    <div class="currentlyActive"><i class="fa-solid fa-user"></i> Active: {Object.keys($chatRoomStore.userList).length}/{$chatRoomStore.maxUsers}</div>
    <div class="optionPanel">    
        {#if !$page.state.showQuickSettingsPanel}            
        <button transition:fade={{duration: 100}} class="button-animate hover roundedBtn play-sound hoverShadow" title="Customize chat" 
            on:click={()=>{
                //showQuickSettingsPanel.set(true)
                //pushState('/quickSettings', { showQuickSettingsPanel: true });
                //current path + /quickSettings
                pushState('/quickSettings', { showQuickSettingsPanel: true });
            }}
        >
            <i class="fa-solid fa-ellipsis-vertical"></i>
        </button>
        {/if}            
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
        color: var(--text-color);

        &::after{
            content: '';
            height: 1px;
            width: 120%;
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(90deg, transparent, var(--glass-color), transparent);
        }
        
        i {
            color: inherit;
            font-size: 0.9rem;
            color: var(--text-color);
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