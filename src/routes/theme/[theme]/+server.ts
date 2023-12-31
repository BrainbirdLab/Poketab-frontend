import { themes } from '$lib/themes.js';

export async function PUT({request, params, cookies}){
    console.log(params);
    try{
        let cookie = request.headers.get('Cookie');
        if (themes[params.theme]){
            cookie = params.theme;
        } else {
            cookie = 'Ocean';
        }

        cookies.set('theme', cookie, { path: '/' });
        //return a success response with setting cookie theme to the value of the request
        return new Response('Success!', { status: 200 });
    } catch(e){
        return new Response('Error!', { status: 400 });
    }
}

export function GET(){
    return new Response('What\'s up? You unlocked a hidded route!👾', { status: 200 });
}