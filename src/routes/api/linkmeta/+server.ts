import puppeteer from 'puppeteer';

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

        url = decodeURIComponentSafe(url);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        const metadata = await page.evaluate(() => {
            const metaTags = Array.from(document.getElementsByTagName('meta'));

            const metadata: { title: string | null; description: string | null; image: string | null } = {
                title: null,
                description: null,
                image: null
            };

            metaTags.forEach((tag) => {
                const name = tag.getAttribute('name') ?? tag.getAttribute('property');
                const content = tag.getAttribute('content');

                if (name === 'og:title' || name === 'twitter:title') {
                    metadata.title = content;
                }

                if (name === 'og:description' || name === 'twitter:description') {
                    metadata.description = content;
                }

                if (name === 'og:image' || name === 'twitter:image') {
                    metadata.image = content;
                }
            });

            return metadata;
        });

        const title = metadata.title ?? '';
        const description = metadata.description ?? '';
        const image = metadata.image ?? '';

        const urlObject = new URL(url);
        const urlWithoutPath = `${urlObject.protocol}//${urlObject.host}`;

        // Close the browser
        await browser.close();

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