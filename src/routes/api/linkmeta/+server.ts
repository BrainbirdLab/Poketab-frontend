import { parseMetadata } from './extractor';

export async function GET({ url }) {

    const link = url.searchParams.get('url');
    if (!link) {
        return new Response('Invalid URL', { status: 400 });
    }

    const data = await parseMetadata(link);

    return new Response(JSON.stringify(data), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}