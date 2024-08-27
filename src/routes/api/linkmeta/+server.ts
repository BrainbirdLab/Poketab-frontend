import type { linkRes } from "$lib/types";

export async function POST({ request }) {
    const form = await request.formData();
    const url = form.get('link')?.toString();

    if (!url) {
        return new Response('No URL provided', { status: 400 });
    }

    const res = await parseMetadata(url);

    if (!res.success) {
        return new Response(res.error, { status: 400 });
    }

    return new Response(JSON.stringify(res), {
        headers: {
            'content-type': 'application/json',
        },
    });
}

function decodeURIComponentSafe(uri: string) {
    try {
        // if has &amp; replace it with &
        return uri.replace(/&amp;/g, '&');
    } catch (_) {
        return uri;
    }
}

async function parseMetadata(url: string): Promise<linkRes> {
    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch link metadata: ' + response.statusText);
        }

        const html = await response.text();

        const titleRegex = /<title[^>]*>([^<]+)<\/title>/i;
        const descriptionRegex = /<meta[^>]*name="description"[^>]*content="([^"]*)"/i;
        const imageRegex = /<meta[^>]*property="og:image"[^>]*content="([^"]*)"/i;

        const titleMatch = RegExp(titleRegex).exec(html);
        const descriptionMatch = RegExp(descriptionRegex).exec(html);
        const imageMatch = RegExp(imageRegex).exec(html);

        const title = titleMatch ? titleMatch[1] : '';
        const description = descriptionMatch ? descriptionMatch[1] : '';
        let image = imageMatch ? imageMatch[1] : '';

        if (image?.startsWith('/')) {
            const urlObject = new URL(url);
            image = `${urlObject.protocol}//${urlObject.host}${image}`;
        }

        if (image) {
            image = decodeURIComponentSafe(image);
        }

        const urlObject = new URL(url);
        const urlWithoutPath = `${urlObject.protocol}//${urlObject.host}`;

        return {
            success: true,
            data: {
                title,
                description,
                image,
                url: urlWithoutPath,
            },
            error: null,
        };
    } catch (_) {
        console.log(_);
        return {
            success: false,
            error: 'Error fetching link metadata',
            data: null,
        };
    }
}