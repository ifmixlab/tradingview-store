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
        processMarket(mongoClient, "crypto",scan_crypto_columns),
        processMarket(mongoClient, "china",scan_stock_columns),
        processMarket(mongoClient, "hongkong",scan_stock_columns),
        processMarket(mongoClient, "america",scan_stock_columns),
    ])
    console.log("mainProcess done.")
}
async function saveHistory(ctx,mongoClient,market,origin_docs) {
    const docs = JSON.parse(JSON.stringify(origin_docs))
    docs.forEach(it=>{
        it.ts = ctx.ts
    })
    await mongo.insertManyDocs(mongoClient, DB_NAME_OD_TV,`indicator_history`, docs);
}

async function saveLatest(ctx,mongoClient,market,origin_docs) {
    const docs = JSON.parse(JSON.stringify(origin_docs))
    const ops = docs.map(it=>{
        const {symbol} = it.meta
        it.ts = ctx.ts
        delete it._id
        const op={
            replaceOne:{
                filter:{
                    "meta.symbol":symbol
                },
                replacement:mongo.fixFieldNameForMongo(it),
                upsert:true
            }
        }
        return op
    })
    await mongo.bulkWrite(mongoClient, `indicator_latest`, ops);
}

async function processMarket(mongoClient, market, columns) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("processMarket start. market:",market)
    // const res ={
    //     data:[
    //         {
    //             s:"test1:symbol1",
    //             d:["bar",100,200,300],
    //         },
    //         {
    //             s:"test2:symbol2",
    //             d:["bar",100,200,400],
    //         }
    //     ]
    // }
    const res = await TradingView.fetchScanDataForAllSymbols(
        market,
        columns
    );
    if(res==null || res.data == null){
        console.error("fetch error, res or res.data is null. ",JSON.stringify(res))
        return;
    }
    const ctx = {
        ts:new Date(),
        market
    }
    const docs = res.data
        .map((it) => {
            if (it.d.length !== columns.length) {
                console.error("len not match, skip. len:",it.d.length," it:",JSON.stringify(it))
                return null;
            }
            const symbol = it.s;
            const obj = {
                meta:{
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
        saveHistory(ctx,mongoClient,market,docs),
        saveLatest(ctx,mongoClient,market,docs),
    ])
    console.log("processMarket done. market:",market)
}
