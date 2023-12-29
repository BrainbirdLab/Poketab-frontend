import { themes } from '$lib/themes';
import { config } from "dotenv";

config();

const version = process.env.npm_package_version;

const server = import.meta.env.VITE_SOCKET_SERVER_URL;

export const prerender = true;

export async function load({cookies}) {

    const theme = cookies.get('theme');

    if (theme){
        if (theme in themes){
            cookies.set('theme', theme, {path: '/'});
            return {
                theme: themes[theme],
                themename: theme,
                version: version,
            }
        } else {
            cookies.set('theme', 'ocean', {path: '/'});
            return {
                theme: themes['ocean'],
                themename: 'ocean',
                version: version,
            }
        }
    } else {
        cookies.set('theme', 'ocean', {path: '/'});
        return {
            theme: themes['ocean'],
            themename: 'ocean',
            version: version,
        }
    }
}