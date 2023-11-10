import { version } from './../../package.json';

export async function load() {
    return {
        props: {
            version,
        },
    }
}