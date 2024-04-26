import { themes } from "$lib/themeTypes";

export async function load({cookies}) {

    let theme = cookies.get('theme') || 'Ocean';

    if (!themes[theme]) {
        theme = 'Ocean';
    }
       return {
        theme
    }
}