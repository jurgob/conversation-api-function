const redisMock = require("redis-mock")
const redisReal = require("redis");

const { promisify } = require("util");

function StorageClient({ application_id, redis_url }) {
    const storageClient = redis_url ? redisReal.createClient(redis_url) : redisMock.createClient();

    const promisifyMethod = (method) => promisify(storageClient[method]).bind(storageClient)

    const prefixKeyFunc = (func) => (...args) => {
        const [key, ...otherArgs] = args
        const prefixedKey = `${application_id}::${key}`
        return func(prefixedKey, ...otherArgs)
    }

    const instance = ["get", "set"]
        .reduce((acc, cur) => {
            acc[cur] = prefixKeyFunc(promisifyMethod(cur));        
            return acc
        }, {})
    
    return instance

}
module.exports = StorageClient