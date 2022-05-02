const {MongoClient} = require("mongodb");

const uri = "mongodb://127.0.0.1:27017/od_tv?readPreference=primary&ssl=false";

const client = new MongoClient(uri);

let connected = false;

async function getClient() {
    if (connected) {
        return client;
    }
    await client.connect();
    connected =true;
    return client;
}

async function run(process) {
    const mongoClient = await getClient();
    await mongoClient.connect()
    try {
        await process(mongoClient)
    } catch (e) {
        console.error("process error. ", e)
    } finally {
        console.log("mongo run done.")
        // await mongoClient.close()
    }
}


module.exports = {
    getClient,
    run
};