const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit) : 25;
    const source = ctx.params.source ?? '';
    const id = ctx.params.id;

    const rootUrl = 'https://kemono.su';
    const mirrorUrl = rootUrl;

    const apiUrl = `${mirrorUrl}/api/v1/discord/channel/lookup/${id}`;
    const currentMirrorUrl = `${mirrorUrl}/${source ? `${source}/${source === 'discord' ? `server/${id}` : `user/${id}`}` : 'posts'}`;
    const currentUrl = currentMirrorUrl.replace(mirrorUrl, rootUrl);

    const headers = {
        cookie: '__ddg2=sBQ4uaaGecmfEUk7',
    };

    const response = await got({
        method: 'get',
        url: source === 'discord' ? apiUrl : currentMirrorUrl,
        headers,
    });

    let items = [],
        title = '',
        image;

    if (source === 'discord') {
        title = `Posts of ${id} from Discord | Kemono`;

        items = await Promise.all(
            response.data.map((channel) =>
                ctx.cache.tryGet(channel.id, async () => {
                    const channelResponse = await got({
                        method: 'get',
                        url: `${mirrorUrl}/api/v1/discord/channel/${channel.id}?o=0`,
                        headers,
                    });

                    return channelResponse.data
                        .filter((i) => i.content || i.attachments)
                        .slice(0, limit)
                        .map((i) => ({
                            title: i.content,
                            description: art(path.join(__dirname, 'templates', 'discord.art'), { i }),
                            author: `${i.author.username}#${i.author.discriminator}`,
                            pubDate: parseDate(i.published),
                            category: channel.name,
                            guid: `kemono:${source}:${i.server}:${i.channel}:${i.id}`,
                            link: `https://discord.com/channels/${i.server}/${i.channel}/${i.id}`,
                        }));
                })
            )
        );
        items = items.flat();
    } else {
        const $ = cheerio.load(response.data);

        title = $('title').text();
        image = $('.user-header__avatar img[src]').attr('src');
        const auther = $('[itemprop]').children().last().text();

        items = $('.card-list__items')
            .children()
            .map((n, element) => {
                const content = cheerio.load(element);
                const link = `${currentUrl}/post/${element.attribs['data-id']}`;
                return {
                    title: content('.post-card__header').text(),
                    description: content.html(),
                    author: auther,
                    pubDate: parseDate(content('.timestamp ').text()),
                    guid: link,
                    link,
                };
            })
            .get();
    }

    title = title.replace('Posts of ', '');

    ctx.state.data = {
        title,
        image,
        link: currentUrl,
        item: items,
    };
};
