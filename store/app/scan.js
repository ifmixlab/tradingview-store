const TradingView = require("../../main");
const mongo = require("../service/mongo");
const scan_stock_columns = require("../../data/scan_stock_columns.json")
const scan_crypto_columns = require("../../data/scan_crypto_columns.json")
const {DB_NAME_OD_TV} = require("../../src/consts");
const utils = require("../utils")

async function main() {
    await mongo.run((client) => mainProcess(client));
    process.exit(0)
}

main();

async function mainProcess(mongoClient) {
    console.log("mainProcess start.")
    await  Promise.all([
        processScreener(mongoClient, "crypto",scan_crypto_columns),
        processScreener(mongoClient, "china",scan_stock_columns),
        processScreener(mongoClient, "hongkong",scan_stock_columns),
        processScreener(mongoClient, "america",scan_stock_columns)
    ])
    console.log("mainProcess done.")
}
async function saveHistory(ctx,mongoClient,screener,origin_docs) {
    const docs = JSON.parse(JSON.stringify(origin_docs))
    docs.forEach(it=>{
        it.ts = ctx.ts
    })
    await mongo.insertManyDocs(mongoClient, DB_NAME_OD_TV,`indicator_history`, docs);
}

async function saveLatest(ctx,mongoClient,screener,origin_docs) {
    const docs = JSON.parse(JSON.stringify(origin_docs))
    const ops = docs.map(it=>{
        const {symbolId} = it.meta
        it.ts = ctx.ts
        delete it._id
        const op={
            replaceOne:{
                filter:{
                    "meta.symbolId":symbolId
                },
                replacement:it,
                upsert:true
            }
        }
        return op
    })
    await mongo.bulkWrite(mongoClient, `indicator_latest`, ops);
}

async function processScreener(mongoClient, screener, columns) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("processScreener start. screener:",screener)
    // const res ={
    //     data:[
    //         {
    //             s:"test1:symbolId1",
    //             d:["bar",100,200,300],
    //         },
    //         {
    //             s:"test2:symbolId2",
    //             d:["bar",100,200,400],
    //         }
    //     ]
    // }
    const res = await TradingView.fetchScanDataForAllSymbols(
        screener.toLowerCase(),
        columns
    );
    if(res==null || res.data == null){
        console.error("fetch error, res or res.data is null. ",JSON.stringify(res))
        return;
    }
    const ctx = {
        ts:new Date(),
        screener
    }
    const docs = res.data
        .map((it) => {
            if (it.d.length !== columns.length) {
                console.error("len not match, skip. len:",it.d.length," it:",JSON.stringify(it))
                return null;
            }
            const symbolId = `${screener}:${it.s}`;
            const obj = {
                meta:{
                    symbolId,
                    screener,
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
        saveHistory(ctx,mongoClient,screener,docs),
        saveLatest(ctx,mongoClient,screener,docs),
    ])
    console.log("processScreener done. screener:",screener)
}
