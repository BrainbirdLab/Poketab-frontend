import { themes } from '$lib/themes.js';

export async function PUT({params, cookies}){
    console.log(params);
    try{
        if (themes[params.theme]){
            cookies.set('theme', params.theme, { path: '/' });
        } else {
            cookies.set('theme', 'Ocean', { path: '/' });
        }
        //return a success response with setting cookie theme to the value of the request
        return new Response('Success!', { status: 200 });
    } catch(e){
        return new Response('Error!', { status: 400 });
    }
}

export function GET(){
    return new Response('What\'s up? You unlocked a hidded route!👾', { status: 200 });
}