import { config } from "dotenv";

config();

const version = process.env.npm_package_version;

export const prerender = true;

export async function load() {

    return {
        version,
    }
}