module.exports = {
    'coomer.st': {
        _name: 'Coomer',
        '.': [
            {
                title: 'Posts',
                docs: 'https://docs.rsshub.app/routes/anime#coomer-posts',
                source: ['/:source/user/:id', '/'],
                target: '/coomer/:source?/:id?',
            },
        ],
    },
};
