import { themes } from "$lib/themes";

export async function load({cookies}) {

    let theme = cookies.get('theme') || 'Ocean';

    if (!themes[theme]) {
        theme = 'Ocean';
    }
       return {
        theme
    }
}