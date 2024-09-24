const mongo = require("../service/mongo");
const {db_name_od_tv,coll_name_indicator_history,coll_name_indicator_latest} = require("../../src/consts");
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

async function saveHistory(ctx, mongoClient, logItems) {
    const docs = logItems.map(it => parseData(it))
    await mongo.insertManyDocs(mongoClient, db_name_od_tv, coll_name_indicator_history, docs, true);
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

async function processItems(mongoClient, logItems) {
    console.log(`processLogItem start. len: ${logItems.length}`)
    if (!logItems) {
        console.error("fetch error, logItems is null. ", JSON.stringify(logItems))
        return;
    }
    const ctx = {}
    await Promise.all([
        saveHistory(ctx, mongoClient, logItems),
        saveLatest(ctx, mongoClient, logItems),
    ])
    console.log(`processLogItem done.  len: ${logItems.length}`)
}

function parseData(logItem) {
    const {_id: logId, market, ts,ts_day, data} = logItem
    const columns = getColumns(market)
    if (data.d.length !== columns.length) {
        console.error("len not match, skip. len:", data.d.length, " data:", JSON.stringify(data))
        return null;
    }
    const symbol = data.s;
    const obj = {
        meta: {
            logId,
            ts,
            ts_day,
            symbol,
            market,
            ...utils.splitTVSymbol(data.s)
        }
    };
    for (let index = 0; index < columns.length; index++) {
        const colName = columns[index];
        obj[colName] = data.d[index];
    }
    // console.log("doc: ", JSON.stringify(obj));
    return obj;
}

module.exports ={
    processItems
}
