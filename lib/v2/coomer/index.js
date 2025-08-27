const kemonoHandler = require('../kemono/index');

module.exports = async (ctx) => {
    ctx.params.site = 'coomer';
    return await kemonoHandler(ctx);
};
