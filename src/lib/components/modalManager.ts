import { page } from '$app/stores';
import { get, writable, type Writable } from 'svelte/store';

console.log('Modal Manager Running');

export let activeModalsStack: Writable<boolean>[] = [];

/*
export const showQuickSettingsPanel = writable(false); //Has shortcut key 's'
showQuickSettingsPanel.subscribe(value => {
    if (value){
        activeModalsStack.push(showQuickSettingsPanel);
    } else {
        //remove it from the stack array
        activeModalsStack = activeModalsStack.filter(modal => modal !== showQuickSettingsPanel);
    }
});
*/
/*
export const showThemesPanel = writable(false); //Has shortcut key 't'
showThemesPanel.subscribe(value => {
    if (value){
        activeModalsStack.push(showThemesPanel);
    } else {
        //remove it from the stack array
        activeModalsStack = activeModalsStack.filter(modal => modal !== showThemesPanel);
    }
});
*/

/*
export const showStickersPanel = writable(false); //Has shortcut key 'i'
showStickersPanel.subscribe(value => {
    if (value){
        activeModalsStack.push(showStickersPanel);
    } else {
        //remove it from the stack array
        activeModalsStack = activeModalsStack.filter(modal => modal !== showStickersPanel);
    }
});
*/

/*
export const showAttachmentPickerPanel = writable(false); //Has shortcut key 'a'
showAttachmentPickerPanel.subscribe(value => {
    if (value){
        activeModalsStack.push(showAttachmentPickerPanel);
    } else {
        //remove it from the stack array
        activeModalsStack = activeModalsStack.filter(modal => modal !== showAttachmentPickerPanel);
    }
});
*/

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