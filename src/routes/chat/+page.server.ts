import { themesMap } from '$lib/themes';

export async function load({cookies}) {

    const theme = cookies.get('theme');
    if (theme){
        if (theme in themesMap){
            return {
                theme: theme,
            }
        } else {
            cookies.set('theme', 'ocean', {path: '/'});
            return {
                theme: 'ocean',
            }
        }
    } else {
        cookies.set('theme', 'ocean', {path: '/'});
        return {
            theme: 'ocean',
        }
    }
}