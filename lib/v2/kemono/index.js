const { parseDate } = require('@/utils/parse-date');

const cache = new Map();
const CACHE_TTL = 2 * 60 * 1000;

const getCachedOrFetch = async (url, options) => {
    const cacheKey = `${url}:${JSON.stringify(options)}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
    });

    return data;
};

module.exports = async (ctx) => {
    const source = ctx.params.source ?? '';
    const id = ctx.params.id;
    const site = ctx.params.site ?? 'kemono';

    const siteConfig = {
        kemono: {
            domain: 'kemono.cr',
            name: 'Kemono',
        },
        coomer: {
            domain: 'coomer.st',
            name: 'Coomer',
        },
    };

    const config = siteConfig[site];
    if (!config) {
        throw new Error(`Unsupported site: ${site}. Supported sites: ${Object.keys(siteConfig).join(', ')}`);
    }

    const currentUrl = `https://${config.domain}/${source}/user/${id}`;
    const apiUrl = `https://${config.domain}/api/v1/${source}/user/${id}/profile`;
    const postsApiUrl = `https://${config.domain}/api/v1/${source}/user/${id}/posts?o=0`;

    const headers = {
        Accept: 'text/css',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
    };

    const fetchOptions = {
        method: 'GET',
        headers,
    };

    const profileData = await getCachedOrFetch(apiUrl, fetchOptions);
    const postsData = await getCachedOrFetch(postsApiUrl, fetchOptions);

    const name = profileData.name;
    const service = profileData.service;
    const title = `${name} from ${service} | ${config.name}`;

    let image;

    const items = postsData.map((i) => {
        let description = i.substring || '';

        if (i.file && i.file.path) {
            const fileUrl = `https://${config.domain}/data${i.file.path}`;
            description += `<br><img src="${fileUrl}" alt="${i.file.name}">`;
        }

        if (i.attachments && i.attachments.length > 0) {
            for (const attachment of i.attachments) {
                const attachmentUrl = `https://${config.domain}/data${attachment.path}`;
                description += /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.name) ? `<img src="${attachmentUrl}" alt="${attachment.name}"><br>` : `<a href="${attachmentUrl}">${attachment.name}</a><br>`;
            }
        }

        return {
            title: i.title,
            description,
            author: `${name}#${source}`,
            pubDate: parseDate(i.published),
            guid: `${site}:${title}:${i.id}:${i.published}`,
            link: `https://${config.domain}/${source}/user/${id}/post/${i.id}`,
        };
    });

    ctx.state.data = {
        title,
        image,
        link: currentUrl,
        item: items,
    };
};
