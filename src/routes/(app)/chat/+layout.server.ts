import { themes } from "$lib/components/chatUI/chatComponents/themesModal.svelte";

export async function load({cookies}) {

    let theme = cookies.get('theme') || 'Ocean';

    if (!themes[theme]) {
        theme = 'Ocean';
    }
       return {
        theme
    }
}