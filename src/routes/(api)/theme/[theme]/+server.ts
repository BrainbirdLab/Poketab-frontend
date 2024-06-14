import { themes, DEFAULT_THEME } from "$lib/themes";

//1 year
const maxAge = 60 * 60 * 24 * 365;

export async function PUT({params, cookies}){
    
    try{
        if (themes[params.theme]){
            cookies.set('theme', params.theme, { path: '/', maxAge: maxAge });
        } else {
            cookies.set('theme', DEFAULT_THEME, { path: '/', maxAge: maxAge });
        }
        //return a success response with setting cookie theme to the value of the request
        return new Response('Success!', { status: 200 });
    } catch(e){
        return new Response('Error!', { status: 400 });
    }
}