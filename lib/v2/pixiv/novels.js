const { parseDate } = require('@/utils/parse-date');
const { getToken } = require('./token');
const config = require('@/config').value;
const getNovels = require('./api/get-novels');

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

    const response = await getNovels(id, token);

    const novels = response.data.novels;
    const username = response.data.user.name;

    ctx.state.data = {
        title: `${username} 的 pixiv 小说`,
        link: `https://www.pixiv.net/users/${id}/novels`,
        description: `${username} 的 pixiv 最新小说`,
        item: novels.map((item) => ({
            title: item.seriesTitle || item.title,
            description: item.caption || item.title,
            link: `${baseUrl}/novel/show.php?id=${item.id}`,
            author: username,
            pubDate: parseDate(item.create_date),

            category: item.tags,
        })),
    };
};
