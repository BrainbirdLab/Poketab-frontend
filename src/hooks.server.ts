import { themes } from "$lib/themes";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
 
    let theme = event.cookies.get('theme') || 'Ocean';

    if (!themes[theme]) {
        event.cookies.set('theme', 'Ocean', { path: '/' });
        theme = 'Ocean';
    }

    return await resolve(event, {
        transformPageChunk: ({html}) => {
            return html.replace('<%theme%>', theme);
        }
    });
};