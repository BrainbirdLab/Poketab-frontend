import { themes } from '$lib/themes';

export async function load({cookies}) {

    const theme: string = cookies.get('theme') || 'Ocean';
    if (theme in themes){
        cookies.set('theme', theme, {path: '/'});
        return {
            themename: theme,
        }
    } else {
        cookies.set('theme', 'Ocean', {path: '/'});
        return {
            themename: 'Ocean',
        }
    }
}