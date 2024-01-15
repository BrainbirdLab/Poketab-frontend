import { redirect } from "@sveltejs/kit";
import { config } from "dotenv"

config();

export function load(){
    const dev = process.env.DEVELOPMENT ? true : false;

    if (!dev){
        redirect(301, "/");
    }    
}