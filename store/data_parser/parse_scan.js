const mongo = require("../service/mongo");
const {db_name_od_tv, db_name_log_tv, coll_name_scan} = require("../../src/consts");
const scan_stock_columns = require("../../data/scan_stock_columns.json")
const scan_crypto_columns = require("../../data/scan_crypto_columns.json")
const utils = require("../utils")


function getColumns(market,version) {
    if(market=="crypto"){
        return scan_crypto_columns;
    }else{
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
    while (!done) {
        const logItems = await findLogItems(mongoClient)
        if (logItems.length==0) {
            done = true;
            console.log("mainProcess skip, no doc")
            return
        }
        const promises = []
        logItems.map((it) => {
            promises.push(processLogItem(mongoClient, it))
        })
        await Promise.all(promises)
    }
    console.log("mainProcess done.")
}

async function findLogItems(mongoClient) {
    const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan)
    const res = await coll.find({parsed: {$ne: true}},{
        limit:1000
    }).toArray();
    // const res = coll.findOne({handled: true});
    return res;
}

async function markLogItemParsed(mongoClient, logItem) {
    const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan)
    const {_id} = logItem
    console.log(`updateLogItem _id:${_id}`)
    const res = await coll.updateOne({
        _id
    }, {
        "$set": {
            parsed: true,
            last_parsed_at:new Date()
        }
    });
    // const res = coll.findOne({handled: true});
    return res;
}

async function saveHistory(ctx, mongoClient, market, docs) {
    await mongo.insertManyDocs(mongoClient, db_name_od_tv, `indicator_history`, docs, true);
}

async function saveLatest(ctx, mongoClient, market, docs) {
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
    await mongo.bulkWrite(mongoClient, `indicator_latest`, ops);
}

async function processLogItem(mongoClient, logItem) {
    const {_id,market, ts, data} = logItem
    console.log(`processLogItem start.  ${market},${_id}`)
    if (data == null) {
        console.error("fetch error, data is null. ", JSON.stringify(logItem))
        return;
    }
    const logId = _id
    const ctx = {
        logId,
        ts,
        market
    }
    const docs = [parseData(logItem)]
    await Promise.all([
        saveHistory(ctx, mongoClient, market, docs),
        saveLatest(ctx, mongoClient, market, docs),
        markLogItemParsed(mongoClient,logItem)
    ])
    console.log(`processLogItem done.  ${market}, ${_id}`)
}

function parseData(logItem) {
    const {_id:logId,market, ts, data} = logItem
    const columns = getColumns(market)
    if (data.d.length !== columns.length) {
        console.error("len not match, skip. len:", data.d.length, " data:", JSON.stringify(data))
        return null;
    }
    const symbol = data.s;
    const obj = {
        logId,
        ts,
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
