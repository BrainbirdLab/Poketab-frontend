import { DEFAULT_THEME, themes } from "$lib/themes";

import type { Handle } from "@sveltejs/kit";

//max age of cookie 200 days
const maxAge = 60 * 60 * 24 * 200;

export const handle: Handle = async ({ event, resolve }) => {
 
    let themeName = event.cookies.get('theme');

    if (!themeName || !themes[themeName]) {
        themeName = DEFAULT_THEME;
    }

    event.cookies.set('theme', themeName, { path: '/', maxAge: maxAge });

    //injects the theme in html
    return await resolve(event, {
        transformPageChunk: ({html}) => {
            return html.replace('<%_accent_%>', themes[themeName].accentColor).replace('<%_theme_%>', themeName);
        }
    });
};