const TradingView = require("../../main");
const mongo = require("../service/mongo");
const scan_stock_columns = require("../../data/scan_stock_columns.json")
const scan_crypto_columns = require("../../data/scan_crypto_columns.json")
const {db_name_log_tv, coll_name_scan_requests} = require("../../src/consts");
const {sleep} = require("../../src/utils")
const PAGE_SIZE = 1000;

async function main() {
    await mongo.run((client) => mainProcess(client));
    process.exit(0)
}

main();

async function mainProcess(mongoClient) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("mainProcess start.")
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
        const rangeStart = page * PAGE_SIZE;
        const rangeEnd = (page + 1) * PAGE_SIZE;
        const range = [
            rangeStart,
            rangeEnd
        ]
        const content = {
            columns,
            range
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
        //         }
        //     ]
        // }
        console.log("request done. ", market, page,retryCount)
        if (response == null || response.data == null) {
            console.error("fetch error, response or response.data is null. ", JSON.stringify(response))
            return;
        }
        const doc = {
            market,
            page,
            content,
            response,
            ts: new Date(),
        }
        const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan_requests);
        const res = await coll.insertOne(doc);
        console.log("processMarketPage done. ", market, page, retryCount)
        if (response.data.length === PAGE_SIZE) {
            await sleep(10)
            await processMarketPage(mongoClient, market, columns, page + 1, 0)
        }
    } catch (e) {
        await sleep(1000)
        console.error("processMarketPage error, will retry.", market, page, retryCount, e)
        await processMarketPage(mongoClient, market, columns, page, retryCount + 1)
    }
}
