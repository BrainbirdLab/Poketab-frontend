import { PUBLIC_API_SERVER_URL } from "$env/static/public"

const server = PUBLIC_API_SERVER_URL;

export async function load(){
    return {
        serverURL : server
    }
}