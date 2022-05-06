const TradingView = require("../../main");
const mongo = require("../service/mongo");
const {db_name_od_tv, db_name_log_tv} = require("../../src/consts")

// const symbolIds = require("../../data/study_symbol_ids.json");
const utils = require("../utils")
const symbolIds = ["hongkong_HKEX:1991", "hongkong_HKEX:531"];

const PAGE_SIZE = 1000000;
const skipHasReport = false;
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
    const coll = mongoClient.db(db_name_log_tv).collection("packet_history");
    const res = await coll.insertOne(doc);
    // await mongo.insertDoc(mongoClient, db_name_log_tv, "packet_history", doc);
    console.log("savePacket done.", JSON.stringify(symbolCtx));
}


async function findHasReportSymbols(mongoClient) {
    const coll = mongoClient.db(db_name_od_tv).collection("study_report_latest")
    const cursor = coll.find({}, {
        limit: 10000000,
        timeout: false,
        projection: {
            "_id": 0,
            "meta.symbol": 1
        }
    })
    const res = await cursor.toArray()
    const obj = {}
    res.map(it => {
        obj[it.meta.symbol] = true
    })
    return obj;
}

async function saveChartInfo(mongoClient, symbolCtx, infos) {
    const {meta} = symbolCtx
    const {symbol} = meta
    if (!symbol) {
        console.error("saveChartInfo error, invalid symbol!");
        return
    }
    const doc = {
        ...infos,
        meta,
        ts: symbolCtx.ts,
    };
    await mongo.replaceDoc(mongoClient, db_name_od_tv, "chart_info", {
        "meta.symbol": symbol
    }, doc)
    console.log("saveChartInfo done.", symbol);
}

async function updatePeriods(mongoClient, collName, symbolCtx, origin_periods) {
    const {meta} = symbolCtx
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
            delete it._id
            const ts=new Date(ti * 1000)
            const doc = {
                ...it,
                meta,
                ts,
            }
            const op = {
                replaceOne: {
                    filter: {
                        "meta.symbol": meta.symbol,
                        ts
                    },
                    replacement: mongo.fixFieldNameForMongo(doc),
                    upsert: true
                }
            }
            return op;
        })
        .filter((it) => it != null);
    console.log("updatePeriods...", meta.symbol);
    await mongo.bulkWrite(mongoClient, collName, ops);
    console.log("updatePeriods done.");
}

async function saveStudyReport(mongoClient, symbolCtx, origin_data) {
    const {meta} = symbolCtx
    const data = JSON.parse(JSON.stringify(origin_data));
    const doc1 = {
        ...symbolCtx,
        ...data,
    };
    const doc2 = {
        ...symbolCtx,
        ...data,
    };
    console.log("saveStudyReport start.");
    await Promise.all([
        mongo.insertDoc(mongoClient, db_name_od_tv, "study_report_history", doc1),
        mongo.replaceDoc(mongoClient, db_name_od_tv, "study_report_latest",
            {"meta.symbol": meta.symbol}, doc2),
    ])
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
    let map = {}
    if (skipHasReport) {
        map = await findHasReportSymbols(mongoClient)
    }
    const noReportSymbols = [];
    symbolIds.map(it => {
        const symbol = it.split("_")[1]
        if (!map[symbol]) {
            noReportSymbols.push(it)
        }
    })

    const candidates = split_array(noReportSymbols, 6)
    console.log(`get candidates done. all: ${symbolIds.length}, noReport: ${noReportSymbols.length}, candidates:`, JSON.stringify(candidates))
    for (let i = 0; i < candidates.length; i++) {
        console.log("process candidates, step:", i)
        const candidate = candidates[i];
        await Promise.all(candidate.map(it => {
            const [market, symbol] = it.split("_")
            return processSymbol(mongoClient, symbol, market);
        }))
    }
    console.log("mainProcess done")
}

async function processSymbol(mongoClient, symbol, market) {
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
            meta: {
                symbol,
                market,
                ...utils.splitTVSymbol(symbol)
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

        let stdDone = false;
        let updateDone = false;

        function checkResolve() {
            console.log("checkResolve... ")
            if (updateDone && stdDone) {
                resolve()
            } else {
                setTimeout(() => {
                    checkResolve()
                }, 1000)
            }
        }

        STD.onError((...err) => {
            console.error("Study error:", ...err);
            reject()
        });

        STD.onReady(async () => {
            console.log("processSymbol done. symbol:", symbol, " STD:", STD.instance.description);
            await tvClient.end()
            stdDone = true;
            checkResolve()
        });

        async function onUpdate() {
            await Promise.all([
                updatePeriods(mongoClient, "chart_detail_daily", symbolCtx, chart.periods),
                updatePeriods(mongoClient, "study_detail_daily", symbolCtx, STD.periods),
                saveStudyReport(
                    mongoClient,
                    symbolCtx,
                    STD.strategyReport
                ),
            ]);
            updateDone = true;

            // await tvClient.end();
            // if (symbol_index >= symbolIds.length - 1) {
            //     console.log("process all symbolIds success.");
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
