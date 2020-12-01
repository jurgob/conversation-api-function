const StorageClient = require('../storageClient.js');


test('value is stored and retrived from db', async () => {
    
    const storageClient = new StorageClient({ application_id: "my-application-id"});
    
    const key = "my-key"
    const value = "my-value"

    await storageClient.set(key, value)
    const valueFromStorage = await storageClient.get(key)

    expect(value).toBe(valueFromStorage);

});