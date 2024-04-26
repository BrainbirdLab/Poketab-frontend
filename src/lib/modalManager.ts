import { writable, type Writable } from 'svelte/store';

export let activeModalsStack: Writable<boolean>[] = [];


export const showImageViewerPanel = writable(false);
showImageViewerPanel.subscribe(value => {
    if (value){
        activeModalsStack.push(showImageViewerPanel);
    } else {
        //remove it from the stack array
        activeModalsStack = activeModalsStack.filter(modal => modal !== showImageViewerPanel);
    }
});

export const showFilePreviewPanel = writable(false);
showFilePreviewPanel.subscribe(value => {
    if (value){
        activeModalsStack.push(showFilePreviewPanel);
    } else {
        //remove it from the stack array
        activeModalsStack = activeModalsStack.filter(modal => modal !== showFilePreviewPanel);
    }
});


export const showMessageOptions = writable(false);
showMessageOptions.subscribe(value => {
    if (value){
        activeModalsStack.push(showMessageOptions);
    } else {
        //remove it from the stack array
        activeModalsStack = activeModalsStack.filter(modal => modal !== showMessageOptions);
    }
});


export const showReactsOnMessageModal = writable(false);
showReactsOnMessageModal.subscribe(value => {
    if (value){
        activeModalsStack.push(showReactsOnMessageModal);
    } else {
        //remove it from the stack array
        activeModalsStack = activeModalsStack.filter(modal => modal !== showReactsOnMessageModal);
    }
});