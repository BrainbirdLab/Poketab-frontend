import { replaceState, pushState } from "$app/navigation";
import { page } from "$app/state";

export function addState(url: string, state: App.PageState){
    if (Object.values(page.state).some(value => value != undefined)){
        replaceState(`${page.url.pathname}#${url}`, state);
    } else {
        pushState(`${page.url.pathname}#${url}`, state);
    }
}

export function resetModals(){
    // if any modal is open, close it
    if (Object.values(page.state).some(value => value != undefined)){
        //history.back can lead to leaving the page so just replace the state with an empty object
        replaceState(page.url.pathname, {});
    }
}

export function clearModals(){
    if (Object.values(page.state).some(value => value != undefined)){
        history.back();
    }
}