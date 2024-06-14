import { DEFAULT_THEME, themes } from "$lib/themes";


export async function load({cookies}) {

    let theme = cookies.get('theme') || DEFAULT_THEME;

    if (!themes[theme]) {
        theme = DEFAULT_THEME;
    }
       return {
        theme
    }
}