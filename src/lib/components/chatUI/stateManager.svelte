<script context="module" lang="ts">

    import { replaceState, pushState } from "$app/navigation";
    import { page } from "$app/stores";
    import { get } from "svelte/store";

    export function addState(url: string, state: App.PageState){
        if (Object.values(get(page).state).some(value => value != undefined)){
            replaceState(`${get(page).url.pathname}#${url}`, state);
        } else {
            pushState(`${get(page).url.pathname}#${url}`, state);
        }
    }

    export function resetModals(){
        // if any modal is open, close it
        if (Object.values(get(page).state).some(value => value != undefined)){
            //history.back can lead to leaving the page so just replace the state with an empty object
            replaceState(get(page).url.pathname, {});
        }
    }

    export function clearModals(){
        if (Object.values(get(page).state).some(value => value != undefined)){
            history.back();
        }
    }
    
</script>