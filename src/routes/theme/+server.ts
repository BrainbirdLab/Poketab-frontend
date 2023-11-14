export async function PUT({request}){
    try{
        const json = await request.json();
        const cookie = json['theme'];
        //return a success response with setting cookie theme to the value of the request
        return new Response('Success!', { status: 200, headers: { 'Set-Cookie': `theme=${cookie}` } });
    } catch(e){
        return new Response('Error!', { status: 400 });
    }
}

export function GET(){
    return new Response('👾', { status: 200 });
}