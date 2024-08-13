import type { linkRes } from "$lib/types";

async function fetcher(url: string) {
    const response = fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        },
    });
    return response;
}

function decodeURIComponentSafe(uri: string) {
    try {
        // if has &amp; replace it with &
        return uri.replace(/&amp;/g, '&');
    } catch (_) {
        return uri;
    }
}

export async function parseMetadata(url: string): Promise<linkRes> {
    try {

        const response = await fetcher(url);


        if (!response.ok) {
            throw new Error('Failed to fetch url');
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

        console.log({ title, description, image, urlWithoutPath });

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