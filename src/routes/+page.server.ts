import { themes } from '$lib/themes';
import { config } from "dotenv";

config();

const version = process.env.npm_package_version;

export const prerender = true;

export async function load({cookies}) {

    const theme = cookies.get('theme') || 'Ocean';

    if (theme in themes){
        cookies.set('theme', theme, {path: '/'});
        return {
            themename: theme,
            version: version,
        }
    } else {
        cookies.set('theme', 'Ocean', {path: '/'});
        return {
            themename: 'Ocean',
            version: version,
        }
    }
}