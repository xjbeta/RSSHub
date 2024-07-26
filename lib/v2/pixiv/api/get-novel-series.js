const got = require('../pixiv-got');
const maskHeader = require('../constants').maskHeader;
const queryString = require('query-string');

/**
 * 获取小说作品系列
 * @param {string} series_id 目标小说系列id
 * @param {string} token pixiv oauth token
 * @param {int} last_order pixiv page*30 (start with 0)
 * @returns {Promise<got.AxiosResponse<{novels: novels[]}>>}
 */
module.exports = function getNovelSeries(series_id, token, last_order) {
    return got('https://app-api.pixiv.net/v2/novel/series', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            series_id,
            filter: 'for_ios',
            last_order,
        }),
    });
};
