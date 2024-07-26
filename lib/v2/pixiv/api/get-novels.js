const got = require('../pixiv-got');
const maskHeader = require('../constants').maskHeader;
const queryString = require('query-string');

/**
 * 获取用户小说作品
 * @param {string} user_id 目标用户id
 * @param {string} token pixiv oauth token
 * @returns {Promise<got.AxiosResponse<{novels: novels[]}>>}
 */
module.exports = function getNovels(user_id, token) {
    return got('https://app-api.pixiv.net/v1/user/novels', {
        headers: {
            ...maskHeader,
            Authorization: 'Bearer ' + token,
        },
        searchParams: queryString.stringify({
            user_id,
            filter: 'for_ios',
        }),
    });
};
