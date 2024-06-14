import { DEFAULT_THEME } from "$lib/themes";

import type { Handle } from "@sveltejs/kit";

//max age of cookie 200 days
const maxAge = 60 * 60 * 24 * 200;

export const handle: Handle = async ({ event, resolve }) => {
 
    let theme = event.cookies.get('theme') || DEFAULT_THEME;

    console.log('theme:', theme);

    event.cookies.set('theme', theme, { path: '/', maxAge: maxAge });

    //injects the theme in html
    return await resolve(event, {
        transformPageChunk: ({html}) => {
            return html.replace('<%_theme_%>', theme);
        }
    });
};