import { themesMap } from '$lib/themes.js';


export async function load({cookies}) {
    const theme = cookies.get('theme');
    if (theme){
        if (theme in themesMap){
            return {
                theme: theme,
            }
        } else {
            return {
                theme: 'ocean',
            }
        }
    } else {
        return {
            theme: 'ocean',
        }
    }
}