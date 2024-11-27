const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const source = ctx.params.source ?? '';
    const id = ctx.params.id;

    const currentUrl = `https://kemono.su/${source}/user/${id}`;

    const apiUrl = `https://kemono.su/api/v1/${source}/user/${id}/profile`;
    const postsApiUrl = `https://kemono.su/api/v1/${source}/user/${id}`;

    const headers = {
        accept: 'application/json',
    };

    const response = await got({
        method: 'get',
        url: apiUrl,
        headers,
    });

    const postsResponse = await got({
        method: 'get',
        url: postsApiUrl,
        headers,
    });

    const name = response.data.name;
    const title = `${name} from ${response.data.service} | Kemono`;

    let image;

    const items = postsResponse.data.map((i) => ({
        title: i.title,
        description: i.content,
        author: `${name}#${source}`,
        pubDate: parseDate(i.edited ?? i.published),
        guid: `kemono:${title}:${i.id}:${i.edited ?? i.published}`,
        link: `https://kemono.su/${source}/user/${id}/post/${i.id}`,
    }));

    ctx.state.data = {
        title,
        image,
        link: currentUrl,
        item: items,
    };
};
