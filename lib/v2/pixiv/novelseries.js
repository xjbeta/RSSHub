const { parseDate } = require('@/utils/parse-date');
const { getToken } = require('./token');
const config = require('@/config').value;
const getNovelSeries = require('./api/get-novel-series');

const baseUrl = 'https://www.pixiv.net';

module.exports = async (ctx) => {
    if (!config.pixiv || !config.pixiv.refreshToken) {
        throw new Error('pixiv RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install/#pei-zhi-bu-fen-rss-mo-kuai-pei-zhi">relevant config</a>');
    }

    const id = ctx.params.id;
    const token = await getToken(ctx.cache.tryGet);
    if (!token) {
        throw new Error('pixiv not login');
    }

    const infoResponse = await getNovelSeries(id, token, 114514);
    const contentCount = infoResponse.data.novel_series_detail.content_count;
    const order = Number.parseInt(contentCount / 30) * 30;
    const response = await getNovelSeries(id, token, order);

    const novels = response.data.novels;
    const username = response.data.novel_series_detail.user.name;

    let index = order;
    ctx.state.data = {
        title: `${username} - ${response.data.novel_series_detail.title}`,
        link: `https://www.pixiv.net/novel/series/${id}`,
        description: `${response.data.novel_series_detail.title} - ${username}`,
        item: novels.map((item) => {
            index += 1;
            return {
                title: `#${index} ${item.seriesTitle || item.title}`,
                description: item.caption || item.title,
                link: `${baseUrl}/novel/show.php?id=${item.id}`,
                author: username,
                pubDate: parseDate(item.create_date),
                category: item.tags,
            };
        }),
    };
};
