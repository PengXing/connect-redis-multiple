/**
 * @file connect-redis-multiple
 * @author sekiyika(px.pengxing@gmail.com)
 * @description
 *  connect-redis-multiple
 */

var connectRedis = require('connect-redis');

module.exports = function (session) {

    /**
     * Express session store
     */
    var Store = session.Store;

    /**
     * connect-redis store
     */
    var RedisStore = connectRedis(session);

    function MultupleRedisStore(options) {
        var self = this;
        self.stores  = {
            read: [],
            write: []
        };

        // default options
        options = options || {};
        options.servers = options.servers || [];
        options.balance = options.balance || 'random';

        self.options = options;

        Store.call(this, options);

        if (options.servers.length === 0) {
            throw new Error('server can\'t be empty');
        }

        options.servers.forEach(function (server) {
            var store = new RedisStore(server);
            var access = server.access || 'RW';

            if (access.indexOf('R') !== -1) {
                self.stores.read.push(store);
            }

            if (access.indexOf('W') !== -1) {
                self.stores.write.push(store);
            }

        });

    }

    MultupleRedisStore.prototype.getStores = function (type) {
        var self = this;
        var balance = self.options.balance;

        var stores;
        if (type === 'write') {
            stores = self.stores.write;
        } else if (type === 'read') {
            stores = self.stores.read;
        }

        switch (balance) {
            case 'random':
                stores = shuffle(stores);
                break;
        }

        return stores;
    };

    /**
     * Attempt to fetch session by the given `sid`.
     *
     * @param {string} sid sid
     * @param {Function} fn callback
     * @api public
     */
    MultupleRedisStore.prototype.get = function (sid, fn) {
        var self = this;
        var stores = self.getStores('read');

        var index = 0;
        var count = stores.length;
        if (count === 0) {
            throw new Error('redis read servers can\'t be empty');
        }
        function next(err) {
            var store = stores[index];
            if (!store) {
                fn(err);
                return;
            }

            store.get(sid, function (err) {
                if (err) {
                    next(err);
                    return;
                }

                fn.apply(null, arguments);
            });
            index++;
        }

        next();
    };

    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param {string} sid sid
     * @param {Session} sess sessionn
     * @param {Function} fn callback
     * @api public
     */
    MultupleRedisStore.prototype.set = function (sid, sess, fn) {
        var self = this;
        var stores = self.getStores('write');

        var index = 0;
        var count = stores.length;
        if (count === 0) {
            throw new Error('redis write servers can\'t be empty');
        }
        function next(err) {
            var store = stores[index];
            if (!store) {
                fn(err);
                return;
            }

            store.set(sid, sess, function (err) {
                if (err) {
                    next(err);
                    return;
                }

                fn.apply(null, arguments);
            });
            index++;
        }

        next();
    };

    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param {string} sid sid
     * @param {Function} fn callback
     * @api public
     */
    MultupleRedisStore.prototype.destroy = function (sid, fn) {
        var self = this;
        var stores = self.getStores('write');

        var index = 0;
        var count = stores.length;
        if (count === 0) {
            throw new Error('redis write servers can\'t be empty');
        }
        function next(err) {
            var store = stores[index];
            if (!store) {
                fn(err);
                return;
            }

            store.destroy(sid, function (err) {
                if (err) {
                    next(err);
                    return;
                }

                fn.apply(null, arguments);
            });
            index++;
        }

        next();
    };

    /**
     * Inherit from `Store`.
     */
    MultupleRedisStore.prototype.__proto__ = Store.prototype;

    /**
     * shuffle
     * @param {Array} array the array to be shuffle
     * @return {Array}
     */
    function shuffle(array) {
        var counter = array.length;
        var temp;
        var index;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = Math.floor(Math.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }

    return MultupleRedisStore;
};
