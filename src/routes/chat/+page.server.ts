import { themes } from '$lib/themes';

export async function load({cookies}) {
    const theme = cookies.get('theme');
    if (theme){
        if (theme in themes){
            cookies.set('theme', theme, {path: '/'});
            return {
                theme: themes[theme],
                themename: theme,
            }
        } else {
            cookies.set('theme', 'ocean', {path: '/'});
            return {
                theme: themes['ocean'],
                themename: 'ocean',
            }
        }
    } else {
        cookies.set('theme', 'ocean', {path: '/'});
        return {
            theme: themes['ocean'],
            themename: 'ocean',
        }
    }
}