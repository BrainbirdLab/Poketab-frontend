import { themes } from "$lib/components/chatUI/chatComponents/themesModal.svelte";

export async function PUT({params, cookies}){
    
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