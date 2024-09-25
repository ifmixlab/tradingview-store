const TradingView = require("../../main");
const mongo = require("../service/mongo");
const scan_stock_columns = require("../../data/scan_stock_columns.json")
const scan_crypto_columns = require("../../data/scan_crypto_columns.json")
const {sleep} = require("../../src/utils");
const { ObjectId } = require("mongodb");
const {processItems} = require("../data_parser/parse_scan")
const REQ_PAGE_SIZE = 10000;
const enablePage = true;
const MAX_RETRY_COUNT = 30;

async function main() {
    console.log(`\n\ncollect start. now: ${new Date().toISOString()}`);
    await mongo.run((client) => mainProcess(client))
      .catch((e)=>{ console.error(`main error: ${e.message}`,e) });
    console.log(`\ncollect complete. now: ${new Date().toISOString()}`);
    process.exit(0)
}
const expire_seconds = 3600*24*7; // 7 day
main();

async function mainProcess(mongoClient) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("mainProcess start.")
    // throw new Error("test error");
    // const coll = mongoClient.db(db_name_log_tv).collection(coll_name_scan);
    // await coll.createIndex({ "meta.ts": 1 }, {expireAfterSeconds: expire_seconds });
    await Promise.all([
        // processMarket(mongoClient, "crypto", scan_crypto_columns),
        processMarket(mongoClient, "china", scan_stock_columns),
        processMarket(mongoClient, "hongkong", scan_stock_columns),
        processMarket(mongoClient, "america", scan_stock_columns),
    ])
    console.log("mainProcess done.")
}

async function processMarket(mongoClient, market, columns) {
    console.log(`\nprocessMarket start. ${market}`)
    await processMarketPage(mongoClient, market, columns, 0)
    console.log(`processMarket done. ${market}\n`)
}

async function processMarketPage(mongoClient, market, columns, page = 0, retryCount = 0) {
    try {
        console.log(`processMarketPage start. ${JSON.stringify({market, page, retryCount})}`);
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
        if(enablePage){
            content.sort = {"sortBy": "name", "sortOrder": "desc"};
            content.range = range;
        }
        console.log(`request start. ${JSON.stringify({market, page, retryCount})}`);
        const response = await TradingView.fetchScanDataRaw(
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
        console.log(`request done. ${JSON.stringify({market, page, retryCount})}`);
        if (response == null || response.data == null) {
            console.error("fetch error, response or response.data is null. ", JSON.stringify(response));
            return;
        }

        // await mongo.insertManyDocs(mongoClient, db_name_log_tv, coll_name_scan, docs)
        await parseResponse(mongoClient,market,response);
        console.log(`processMarketPage done. ${JSON.stringify({market, page, retryCount})}`);
        if (enablePage && response.data.length === REQ_PAGE_SIZE) {
            await sleep(100);
            await processMarketPage(mongoClient, market, columns, page + 1, 0);
        }
    } catch (e) {
        if (retryCount >= MAX_RETRY_COUNT) {
            console.error(`processMarketPage error, max retry count reached. ${JSON.stringify({market, page, retryCount})}`);
            throw new Error("max retry count reached.");
        }else{
            await sleep(1000);
            console.error(`processMarketPage error, will retry. ${JSON.stringify({market, page, retryCount,error:e.message})}`);
            await processMarketPage(mongoClient, market, columns, page, retryCount + 1);
        }
    }
}

async function parseResponse(mongoClient,market,response){
    const ts = new Date();
    const ts_day = new Date();
    ts_day.setUTCHours(0, 0, 0, 0);
    const docs = response.data
        .map((it) => {
            const obj = {
                _id: new ObjectId(),
                market,
                v: 1, // reqVersion
                ts,
                ts_day,
                data: it,
            };
            return obj;
        })
        .filter((it) => it != null);
    return await processItems(mongoClient, docs);
}
