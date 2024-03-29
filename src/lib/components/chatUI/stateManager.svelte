<script context="module" lang="ts">

    import { replaceState, pushState } from "$app/navigation";
    import { page } from "$app/stores";
    import { get } from "svelte/store";

    export function addState(url: string, state: App.PageState){
        if (get(page).state.showQuickSettingsPanel){
            replaceState(url, state);
        } else {
            pushState(url, state);
        }
    }
    
</script>