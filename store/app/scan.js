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
        processType(mongoClient, "crypto",scan_crypto_columns),
        processType(mongoClient, "china",scan_stock_columns),
        processType(mongoClient, "hongkong",scan_stock_columns),
        processType(mongoClient, "america",scan_stock_columns)
    ])
    console.log("mainProcess done.")
}
async function saveHistory(ctx,mongoClient,type,origin_docs) {
    const docs = JSON.parse(JSON.stringify(origin_docs))
    docs.forEach(it=>{
        it.ts = ctx.ts
        delete it.symbol
    })
    await mongo.insertManyDocs(mongoClient, DB_NAME_OD_TV,`indicator_history`, docs);
}

async function saveLatest(ctx,mongoClient,type,origin_docs) {
    const docs = JSON.parse(JSON.stringify(origin_docs))
    const ops = docs.map(it=>{
        const {screener} = ctx
        const {symbol} = it
        delete it._id
        delete it.symbol
        it.ts = ctx.ts
        const op={
            replaceOne:{
                filter:{
                    _id:`${screener}_${symbol}`,
                },
                replacement:it,
                upsert:true
            }
        }
        return op
    })
    await mongo.bulkWrite(mongoClient, `indicator_latest`, ops);
}

async function processType(mongoClient, type, columns) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("processType start. type:",type)
    // const res = await TradingView.fetchScanData(
    //   ["NASDAQ:LTRPB", "NYSE:MMU"],
    //   type,
    //     columns
    // );
    // const res ={
    //     data:[
    //         {
    //             s:"test:symbol1",
    //             d:["bar",1,2,3],
    //         },
    //         {
    //             s:"test:symbol2",
    //             d:["bar",1,2,4],
    //         }
    //     ]
    // }
    const res = await TradingView.fetchScanDataForAllSymbols(
        type,
        columns
    );
    if(res==null || res.data == null){
        console.error("fetch error, res or res.data is null. ",JSON.stringify(res))
        return;
    }
    const ctx = {
        ts:new Date(),
        screener:type
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
                    screener: type,
                    ...utils.splitSymbol(symbol)
                },
                symbol
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
        saveHistory(ctx,mongoClient,type,docs),
        saveLatest(ctx,mongoClient,type,docs),
    ])
    console.log("processType done. type:",type)
}
