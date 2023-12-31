import { themes } from "$lib/themes";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
 
    const theme = event.cookies.get('theme') || 'Ocean';

    if (!themes[theme]) {
        event.cookies.set('theme', 'Ocean', { path: '/' });
    }

    return await resolve(event, {
        transformPageChunk: ({html}) => {
            return html.replace('[theme]', theme);
        }
    });
};