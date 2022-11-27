const mongo = require("../service/mongo");
const {db_name_od_tv, db_name_log_tv, coll_name_scan,coll_name_indicator_hour,coll_name_indicator_latest} = require("../../src/consts");
const scan_stock_columns = require("../../data/scan_stock_columns.json")
const scan_crypto_columns = require("../../data/scan_crypto_columns.json")
const utils = require("../utils")
const _ = require("lodash");

function getColumns(market, version) {
    if (market == "crypto") {
        return scan_crypto_columns;
    } else {
        return scan_stock_columns;
    }
}

async function main() {
    await mongo.run((client) => mainProcess(client));
    process.exit(0)
}

main();

async function mainProcess(mongoClient) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("mainProcess start.")
    let done = false;
    let count = 0;
    while (!done) {
        console.log(`mainProcess count: ${count}`);
        const logItems = await findLogItems(mongoClient)
        if (logItems.length == 0) {
            done = true;
            console.log(`mainProcess done. count: ${count}`)
            return
        }
        await processLogItems(mongoClient, logItems)
        count++;
        // done=true
    }

}

async function findLogItems(mongoClient) {
    const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan)
    const res = await coll.find({parsed: {$ne: true}}, {
        limit: 1000
    }).toArray();
    // const res = await coll.find({}, {
    //     limit: 1
    // }).toArray();
    // const res = coll.findOne({handled: true});
    return res;
}

async function markLogItemsParsed(ctx, mongoClient, logItems) {
    const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan)
    console.log(`markLogItemsParsed start. len: ${logItems.length}`)
    const ops = logItems.map(it => {
        const {_id} = it
        const op = {
            updateOne: {
                filter: {
                    _id
                },
                update: {
                    "$set": {
                        parsed: true,
                        last_parsed_at: new Date()
                    }
                }
            }
        }
        return op
    })
    const res = await coll.bulkWrite(ops, {bypassDocumentValidation: true, ordered: false})
    // const res = coll.findOne({handled: true});
    return res;
}

async function saveHistory(ctx, mongoClient, logItems) {
    const docs = logItems.map(it => parseData(it))
    await mongo.insertManyDocs(mongoClient, db_name_od_tv, coll_name_indicator_hour, docs, true);
}

async function saveLatest(ctx, mongoClient, logItems) {
    const docs = logItems.map(it => parseData(it))
    const ops = docs.map(it => {
        const {symbol} = it.meta
        delete it._id
        const op = {
            replaceOne: {
                filter: {
                    "meta.symbol": symbol
                },
                replacement: mongo.fixFieldNameForMongo(it),
                upsert: true
            }
        }
        return op
    })
    await mongo.bulkWrite(mongoClient, coll_name_indicator_latest, ops);
}

async function processLogItems(mongoClient, logItems) {
    console.log(`processLogItem start. len: ${logItems.length}`)
    if (!logItems) {
        console.error("fetch error, logItems is null. ", JSON.stringify(logItems))
        return;
    }
    const ctx = {}
    await Promise.all([
        saveHistory(ctx, mongoClient, logItems),
        saveLatest(ctx, mongoClient, logItems),
        markLogItemsParsed(ctx, mongoClient, logItems)
    ])
    console.log(`processLogItem done.  len: ${logItems.length}`)
}

function parseData(logItem) {
    const {_id: logId, market, ts, data} = logItem
    const columns = getColumns(market)
    if (data.d.length !== columns.length) {
        console.error("len not match, skip. len:", data.d.length, " data:", JSON.stringify(data))
        return null;
    }
    const symbol = data.s;
    const ts_day = _.cloneDeep(ts);
    ts_day.setUTCHours(0, 0, 0, 0)
    const obj = {
        logId,
        ts,
        ts_day,
        meta: {
            symbol,
            market,
            ...utils.splitTVSymbol(data.s)
        }
    };
    for (let index = 0; index < columns.length; index++) {
        const colName = columns[index];
        const value = data.d[index];
        obj[colName] = value;
    }
    // console.log("doc: ", JSON.stringify(obj));
    return obj;
}
