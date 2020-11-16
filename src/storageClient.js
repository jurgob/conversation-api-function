const redis = require("redis-mock")
const { promisify } = require("util");

module.exports = function StorageClient() {
    const storageClient = redis.createClient();
    const get = promisify(storageClient.get).bind(storageClient);
    const set = promisify(storageClient.set).bind(storageClient);
    return {
        get,
        set
    }
}
// module.exports = StorageClient

// const storageClient = new StorageClient();
// const test = async () => {
//     const username = "jurgo"
//     console.log(' Log 0')
//     const storageUser = await storageClient.set(`user:${username}`, 'my-id-data')
//     console.log(' Log 1')
//     const storageUser2 = await storageClient.get(`user:${username}`)
//     console.log(' Log 2', storageUser2)

// }

// test()
