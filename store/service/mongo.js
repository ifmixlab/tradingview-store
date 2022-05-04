const {MongoClient} = require("mongodb");
const {DB_NAME_OD_TV} = require("../../src/consts")

const uri = "mongodb://127.0.0.1:27017/od_tv?readPreference=primary&ssl=false";

const client = new MongoClient(uri);

let connected = false;

async function insertDoc(mongoClient,dbName, collName, doc) {
    try {
        // console.log("insertDoc, collName: ", collName, " doc: ", JSON.stringify(doc));
        const coll = mongoClient.db(dbName).collection(collName);
        const res = await coll.insertOne(doc);
        console.log("insertDoc done. collName: ", collName);
        return res;
    } catch (e) {
        console.error("insertDoc error. collName: ", collName, doc, e);
    }
}

async function replaceDoc(mongoClient,dbName, collName,filter, doc) {
    try {
        const coll = mongoClient.db(dbName).collection(collName);
        const res = await coll.replaceOne(filter, doc, {
            upsert: true
        });
        console.log("replaceDoc done. collName: ", collName);
        return res;
    } catch (e) {
        console.error("replaceDoc error. collName: ", collName, doc, e);
    }
}

async function insertManyDocs(mongoClient, dbName,collName, docs) {
    try {
        console.log(
            "insertManyDocs, collName: ",
            collName,
            " docs.length: ",
            docs.length
        );
        const coll = mongoClient.db(dbName).collection(collName);
        const res = await coll.insertMany(docs, {bypassDocumentValidation:true,ordered: false});
        console.log("insertManyDocs done. collName: ", collName);
        return res;
    } catch (e) {
        console.error("insertManyDocs error. collName: ", collName, docs, e);
    }
}

async function bulkWrite(mongoClient, collName, ops) {
    try {
        console.log(
            "bulkWrite, collName: ",
            collName,
            " ops.length: ",
            ops.length
        );
        const coll = mongoClient.db(DB_NAME_OD_TV).collection(collName);
        const res = await coll.bulkWrite(ops, {bypassDocumentValidation: true, ordered: false})
        console.log("bulkWrite done. collName: ", collName);
        return res;
    } catch (e) {
        console.error("bulkWrite error. collName: ", collName, e);
    }
}

async function getClient() {
    if (connected) {
        return client;
    }
    await client.connect();
    connected = true;
    return client;
}

async function run(process) {
    const mongoClient = await getClient();
    await mongoClient.connect();
    try {
        await process(mongoClient);
    } catch (e) {
        console.error("process error. ", e);
    } finally {
        console.log("mongo run done.");
        // await mongoClient.close()
    }
}

module.exports = {
    getClient,
    run,
    insertDoc,
    replaceDoc,
    insertManyDocs,
    bulkWrite,
};
