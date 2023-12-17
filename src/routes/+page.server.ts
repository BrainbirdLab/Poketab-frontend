import { themesMap } from '$lib/themes';
import { version } from './../../package.json';

const server = import.meta.env.VITE_SOCKET_SERVER_URL;

export const prerender = true;

export async function load({cookies}) {

    const theme = cookies.get('theme');

    const systemRes = await fetch(server);

    let ok = await systemRes.text();

    console.log(ok);

    if (theme){
        if (theme in themesMap){
            return {
                theme: theme,
                version: version,
                systemOk: ok,
            }
        } else {
            cookies.set('theme', 'ocean', {path: '/'});
            return {
                theme: 'ocean',
                version: version,
                systemOk: ok,
            }
        }
    } else {
        cookies.set('theme', 'ocean', {path: '/'});
        return {
            theme: 'ocean',
            version: version,
            systemOk: ok,
        }
    }
}