import { redirect } from "@sveltejs/kit";

import { DEVELOPMENT } from "$env/static/private";

export function load(){

    try {
        const dev = DEVELOPMENT == "true"
    
        if (!dev){
            redirect(301, "/");
        }
    } catch (e) {
        redirect(301, "/");
    }

}