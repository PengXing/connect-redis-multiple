# connect-redis-multiple

`connect-redis-multiple` is a __distributed Redis supported__ session store backed by [connect-redis](https://github.com/tj/connect-redis).

## Installation

```
$ npm install connect-redis-multiple
```

## Options

- `servers` The redis server
- `balance` The load balance strategy

`servers` is an array. The item of the array is options for `connect-redis` except `access`.

- `access` The redis server is read-only, write-only or RW. `RW`, `R`, `W`

Any options not included in this list will be passed to the `connect-redis` directly.

## Usage

Pass the `express-session` store into `connect-redis-multiple` to create a `RedisStore` constructor.

```javascript
var options = {
    servers: [
        {
            host: '127.0.0.1',
            port: 7220,
            prefix: 'web-sess:',
            access: 'RW'
        }
    ],
    balance: 'random'
};

var session = require('express-session');
var MultipleRedisStore = require('connect-redis-multiple')(session);

app.use(session({
    store: new MultipleRedisStore(options),
    secret: 'keyboard cat'
}));
```
## License

MIT
