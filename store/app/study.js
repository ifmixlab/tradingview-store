const TradingView = require("../../main");
const mongo = require("../service/mongo");
const {DB_NAME_OD_TV, DB_NAME_LOG_TV} = require("../../src/consts")

const symbols = require("../../data/study_symbols.json");
const utils = require("../utils")
// const symbols = ["NASDAQ:MDXH",
//     "NYSE:AGCB",
//     "AMEX:USFR",
//     "NASDAQ:GTYH"];

const PAGE_SIZE = 1000000;
const strategyInfo = {
    name: "GetYourTrend",
    version: "1.0",
    scriptId: "PUB;ac51f0ccf0314382ad0fb9b9709ab576",
};

async function main() {
    await mongo.run((client) => mainProcess(client));
    throw new Error("main done");
}

main();

async function savePacket(mongoClient, symbolCtx, data) {
    const doc = {
        ...symbolCtx,
        d: data,
    };
    delete doc.symbol
    await mongo.insertDoc(mongoClient, DB_NAME_LOG_TV,"packet_history", doc);
    console.log("savePacket done.", JSON.stringify(symbolCtx));
}

async function findHasReportSymbols(mongoClient) {
    const coll = mongoClient.db(DB_NAME_OD_TV).collection("study_report_history")
    const cursor = coll.find({}, {
        limit: 10000000,
        timeout: false,
        projection: {
            "_id": 0,
            "symbol": 1
        }
    })
    const res = await cursor.toArray()
    const obj = {}
    res.map(it => obj[it.symbol] = true)
    return obj;
}

async function saveChartInfo(mongoClient, symbolCtx, infos) {
    const {symbol} = symbolCtx
    if (!symbol) {
        console.error("saveChartInfo error, invalid symbol!");
        return
    }
    const doc = {
        ...infos,
        meta: symbolCtx.meta,
        ts: new Date(),
    };
    const coll = mongoClient.db(DB_NAME_OD_TV).collection("chart_info")
    const res = await coll.replaceOne({
        _id: symbol
    }, doc, {
        upsert: true
    });
    console.log("saveChartInfo done.", symbolCtx.symbol);
}

async function updatePeriods(mongoClient, collName, symbolCtx, origin_periods) {
    const periods = JSON.parse(JSON.stringify(origin_periods));
    const ops = periods
        .map((it) => {
            if (it.$time) {
                it.time = it.$time
                delete it.$time
            }
            const ti = it.time;
            if (ti == null) {
                return null;
            }
            delete it.time
            delete it.symbol
            const _id = `${symbolCtx.symbol}_${ti}`;
            const doc = {
                ...it,
                meta: symbolCtx.meta,
                ts: new Date(ti * 1000),
            }
            const op = {
                replaceOne: {
                    filter: {
                        _id,
                    },
                    replacement: doc,
                    upsert: true
                }
            }
            return op;
        })
        .filter((it) => it != null);
    console.log("updatePeriods...", symbolCtx.symbol);
    await mongo.bulkWrite(mongoClient, collName, ops);
    console.log("updatePeriods done.");
}

async function saveStudyReport(mongoClient, collName, symbolCtx, origin_data) {
    const data = JSON.parse(JSON.stringify(origin_data));
    const doc = {
        ...symbolCtx,
        ...data,
    };
    console.log("saveStudyReport...", symbolCtx.symbol);
    await mongo.insertDoc(mongoClient,DB_NAME_OD_TV, collName, doc);
    console.log("saveStudyReport done.");
}

function split_array(arr, len) {
    let arr_length = arr.length;
    let newArr = [];
    for (let i = 0; i < arr_length; i += len) {
        newArr.push(arr.slice(i, i + len));
    }
    return newArr;
}


async function mainProcess(mongoClient) {
    console.log("mainProcess start")
    const map = await findHasReportSymbols(mongoClient)
    const noReportSymbols = [];
    symbols.map(it => {
        if (!map[it]) {
            noReportSymbols.push(it)
        }
    })
    const candidates = split_array(noReportSymbols, 5)
    console.log("candidates:", JSON.stringify(candidates))
    for (let i = 0; i < candidates.length; i++) {
        console.log("process candidates, step:", i)
        const candidate = candidates[i];
        await Promise.all(candidate.map(it => {
            return processSymbol(mongoClient, it);
        }))
    }
    console.log("mainProcess done")
}

async function processSymbol(mongoClient, symbol) {
    if (!symbol) {
        console.error("processSymbol skip. symbol is invalid:", symbol);
        return;
    }
    console.log("processSymbol start. symbol:", symbol);
    return new Promise(async (resolve, reject) => {
        const tvClient = new TradingView.Client({
            DEBUG: true,
        });
        const symbolCtx = {
            symbol,
            meta: {
                ...utils.splitSymbol(symbol)
            },
            ts: new Date(),
            strategyInfo,
            marketOptions: {
                // Set the market
                timeframe: "D",
                currency: "USD",
                range: PAGE_SIZE,
            },
        };
        tvClient.onPacket((data) => {
            savePacket(mongoClient, symbolCtx, data);
        });
        const chart = new tvClient.Session.Chart(); // Init a Chart session
        chart.setTimezone("Asia/Shanghai");
        chart.setMarket(symbol, symbolCtx.marketOptions);

        chart.onSymbolLoaded(() => {
            // When the symbol is successfully loaded
            console.log(`Market "${chart.infos.description}" loaded !`);
            saveChartInfo(mongoClient, symbolCtx, chart.infos);
        });

        const indic = await TradingView.getIndicator(strategyInfo.scriptId);
        const STD = new chart.Study(indic);

        STD.onError((...err) => {
            console.error("Study error:", ...err);
            reject()
        });

        STD.onReady(async () => {
            console.log("processSymbol done. symbol:", symbol, " STD:", STD.instance.description);
            await tvClient.end()
            resolve()
        });

        async function onUpdate() {
            await Promise.all([
                updatePeriods(mongoClient, "chart_detail_day", symbolCtx, chart.periods),
                updatePeriods(mongoClient, "study_detail_day", symbolCtx, STD.periods),
                saveStudyReport(
                    mongoClient,
                    "study_report_history",
                    symbolCtx,
                    STD.strategyReport
                ),
            ]);
            // await tvClient.end();
            // if (symbol_index >= symbols.length - 1) {
            //     console.log("process all symbols success.");
            //     throw new Error("exit");
            // } else {
            //     await sleep(1000);
            //     processSymbol(mongoClient, symbol_index + 1);
            // }
        }

        STD.onUpdate(() => {
            onUpdate();
        });
    })
}
