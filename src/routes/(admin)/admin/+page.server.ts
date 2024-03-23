
const server = import.meta.env.VITE_API_SERVER_URL;

export async function load(){
    return {
        serverURL : server
    }
}