
var session = require('express-session');

var MultipleRedisStore = require('./lib/connect-redis-multiple')(session);

var options = {
    servers: [
        {
            host: '127.0.0.1',
            port: 6379,
            client: null,
            socket: null,
            ttl: 1000,
            disableTTL: false,
            prefix: 'sess:',
            access: 'RW'
        },
        {
            host: '127.0.0.1',
            port: 6379,
            client: null,
            socket: null,
            ttl: 1000,
            disableTTL: false,
            prefix: 'sess:',
            access: 'R'
        }
    ],
    balance: 'random',
};

var store = new MultipleRedisStore(options);
