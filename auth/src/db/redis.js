const { Redis } = require('ioredis')

// During tests we must not connect to the production Redis instance.
// Provide a lightweight in-memory mock that supports the operations
// used by the app (`set`, `get`, `del`, `on`, `quit`).
if (process.env.NODE_ENV === 'test') {
    const store = new Map()

    const mock = {
        async set(key, value, ...args) {
            // support: set(key, value, 'EX', seconds)
            store.set(key, String(value))
            if (args && args.length >= 2 && String(args[0]).toUpperCase() === 'EX') {
                const seconds = Number(args[1]) || 0
                if (seconds > 0) {
                    const t = setTimeout(() => store.delete(key), seconds * 1000)
                    // Do not let long-lived timers keep the event loop alive during tests
                    if (typeof t.unref === 'function') t.unref()
                }
            }
            return 'OK'
        },
        async get(key) {
            return store.has(key) ? store.get(key) : null
        },
        async del(key) {
            return store.delete(key) ? 1 : 0
        },
        on() {},
        quit: async () => {},
    }

    console.log('Using in-memory Redis mock for tests')
    module.exports = mock
} else {
    const redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
    })

    redis.on('connect', () => {
        console.log('Connected to Redis')
    })

    module.exports = redis
}