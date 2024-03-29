<script context="module" lang="ts">

    import { replaceState, pushState } from "$app/navigation";
    import { page } from "$app/stores";
    import { get } from "svelte/store";

    export function addState(url: string, state: App.PageState){
        if (Object.values(get(page).state).some(value => value === true)){
            console.log('Replacing state');
            replaceState(`${get(page).url.pathname}#${url}`, state);
        } else {
            console.log('Pushing state');
            pushState(`${get(page).url.pathname}#${url}`, state);
        }
    }

    export function clearModals(){
        if (Object.values(get(page).state).some(value => value === true)){
            history.back();
        }
    }
    
</script>