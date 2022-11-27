const TradingView = require("../../main");
const mongo = require("../service/mongo");
const scan_stock_columns = require("../../data/scan_stock_columns.json")
const scan_crypto_columns = require("../../data/scan_crypto_columns.json")
const {db_name_log_tv, coll_name_scan} = require("../../src/consts");
const {sleep} = require("../../src/utils")
const REQ_PAGE_SIZE = 1000;

async function main() {
    await mongo.run((client) => mainProcess(client));
    process.exit(0)
}
const expire_seconds = 3600*24*7; // 7 day
main();

async function mainProcess(mongoClient) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("mainProcess start.")
    
    const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan);
    await coll.createIndex({ "ts": 1 }, {expireAfterSeconds: expire_seconds });
    
    await Promise.all([
        processMarket(mongoClient, "crypto", scan_crypto_columns),
        processMarket(mongoClient, "china", scan_stock_columns),
        processMarket(mongoClient, "hongkong", scan_stock_columns),
        processMarket(mongoClient, "america", scan_stock_columns),
    ])
    console.log("mainProcess done.")
}

async function processMarket(mongoClient, market, columns) {
    console.log("processMarket start. ", market)
    await processMarketPage(mongoClient, market, columns, 0)
    console.log("processMarket done. ", market)
}

async function processMarketPage(mongoClient, market, columns, page = 0, retryCount = 0) {
    try {
        console.log("processMarketPage start. ", market, page, retryCount)
        const rangeStart = page * REQ_PAGE_SIZE;
        const rangeEnd = (page + 1) * REQ_PAGE_SIZE;
        const range = [
            rangeStart,
            rangeEnd
        ]
        const content = {
            columns,
            // range
        };
        const response = await TradingView.fetchScanData(
            market,
            content
        );
        // const response = {
        //     data: [
        //         {
        //             s: "test1:symbol1",
        //             d: ["bar", 100, 200, 300],
        //         },
        //         {
        //             s: "test2:symbol2",
        //             d: ["bar", 100, 200, 400],
        //         },
        //         {
        //             s: "test3:symbol3",
        //             d: ["bar", 100, 200, 400],
        //         },
        //         {
        //             s: "test1:symbol4",
        //             d: ["bar", 100, 200, 300],
        //         },
        //         {
        //             s: "test2:symbol5",
        //             d: ["bar", 100, 200, 400],
        //         },
        //         {
        //             s: "test3:symbol6",
        //             d: ["bar", 100, 200, 400],
        //         },
        //         {
        //             s: "test3:symbol7",
        //             d: ["bar", 100, 200, 400],
        //         }
        //     ]
        // }
        console.log("request done. ", market, page, retryCount)
        if (response == null || response.data == null) {
            console.error("fetch error, response or response.data is null. ", JSON.stringify(response))
            return;
        }
        const ts = new Date()
        const ts_day = new Date();
        ts_day.setUTCHours(0, 0, 0, 0)
        const docs = response.data
            .map((it) => {
                const obj = {
                    market,
                    reqVersion: 1,
                    ts,
                    ts_day,
                    data: it,
                };
                return obj;
            })
            .filter((it) => it != null);
        await mongo.insertManyDocs(mongoClient, db_name_log_tv, coll_name_scan, docs)
        console.log("processMarketPage done. ", market, page, retryCount)
        if (response.data.length === REQ_PAGE_SIZE) {
            await sleep(10)
            await processMarketPage(mongoClient, market, columns, page + 1, 0)
        }
    } catch (e) {
        await sleep(1000)
        console.error("processMarketPage error, will retry.", market, page, retryCount, e)
        await processMarketPage(mongoClient, market, columns, page, retryCount + 1)
    }
}
