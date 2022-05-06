const TradingView = require("../../main");
const mongo = require("../service/mongo");
const scan_stock_columns = require("../../data/scan_stock_columns.json")
const scan_crypto_columns = require("../../data/scan_crypto_columns.json")
const {db_name_od_tv, db_name_log_tv, coll_name_scan_requests} = require("../../src/consts");
const utils = require("../utils")

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
        const logItem = await findOneLogItem(mongoClient)
        if (!logItem) {
            done = true;
            console.log("mainProcess skip, no doc")
            return
        }
        await processLogItem(mongoClient, logItem)
        await updateLogItem(mongoClient,logItem)
    }
    console.log("mainProcess done.")
}

async function findOneLogItem(mongoClient) {
    const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan_requests)
    const res = await coll.findOne({parsed: {$ne: true}});
    // const res = coll.findOne({handled: true});
    return res;
}

async function updateLogItem(mongoClient, logItem) {
    const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan_requests)
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

async function saveHistory(ctx, mongoClient, market, origin_docs) {
    const docs = JSON.parse(JSON.stringify(origin_docs))
    docs.forEach(it => {
        it.ts = ctx.ts
    })
    await mongo.insertManyDocs(mongoClient, db_name_od_tv, `indicator_history`, docs, true);
}

async function saveLatest(ctx, mongoClient, market, origin_docs) {
    const docs = JSON.parse(JSON.stringify(origin_docs))
    const ops = docs.map(it => {
        const {symbol} = it.meta
        it.ts = ctx.ts
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
    const {_id,market, content, ts, response: res} = logItem
    console.log(`processLogItem start.  ${market},${_id}`)
    if (res == null || res.data == null) {
        console.error("fetch error, res or res.data is null. ", JSON.stringify(res))
        return;
    }
    const logId = _id
    const {columns} = content
    const ctx = {
        logId,
        ts,
        market
    }
    const docs = res.data
        .map((it) => {
            if (it.d.length !== columns.length) {
                console.error("len not match, skip. len:", it.d.length, " it:", JSON.stringify(it))
                return null;
            }
            const symbol = it.s;
            const obj = {
                meta: {
                    symbol,
                    market,
                    ...utils.splitTVSymbol(it.s)
                }
            };
            for (let index = 0; index < columns.length; index++) {
                const colName = columns[index];
                const value = it.d[index];
                obj[colName] = value;
            }
            // console.log("doc: ", JSON.stringify(obj));
            return obj;
        })
        .filter((it) => it != null);
    await Promise.all([
        saveHistory(ctx, mongoClient, market, docs),
        saveLatest(ctx, mongoClient, market, docs),
    ])
    console.log(`processLogItem done.  ${market},${_id}`)
}
