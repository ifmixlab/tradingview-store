const TradingView = require("../../main");
const mongo = require("../service/mongo");
const {DB_NAME_OD_TV, DB_NAME_LOG_TV} = require("../../src/consts")

const symbolIds = require("../../data/study_symbol_ids.json");
const utils = require("../utils")
// const symbolIds = ["hongkong:HKEX:8020", "america:NASDAQ:APMI"];

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
    await mongo.insertDoc(mongoClient, DB_NAME_LOG_TV, "packet_history", doc);
    console.log("savePacket done.", JSON.stringify(symbolCtx));
}


async function findHasReportSymbols(mongoClient) {
    const coll = mongoClient.db(DB_NAME_OD_TV).collection("study_report_latest")
    const cursor = coll.find({}, {
        limit: 10000000,
        timeout: false,
        projection: {
            "_id": 0,
            "meta.symbolId": 1
        }
    })
    const res = await cursor.toArray()
    const obj = {}
    res.map(it => {
        obj[it.meta.symbolId] = true
    })
    return obj;
}

async function saveChartInfo(mongoClient, symbolCtx, infos) {
    const { meta} = symbolCtx
    const {symbolId} = meta
    if (!symbolId) {
        console.error("saveChartInfo error, invalid symbolId!");
        return
    }
    const doc = {
        ...infos,
        meta,
        ts: symbolCtx.ts,
    };
    const coll = mongoClient.db(DB_NAME_OD_TV).collection("chart_info")
    const res = await coll.replaceOne({
        "meta.symbolId": symbolId
    }, doc, {
        upsert: true
    });
    console.log("saveChartInfo done.", symbolId);
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
            const doc = {
                ...it,
                meta,
                ts: new Date(ti * 1000),
            }
            const op = {
                replaceOne: {
                    filter: {
                        "meta.symbolId": meta.symbolId
                    },
                    replacement: doc,
                    upsert: true
                }
            }
            return op;
        })
        .filter((it) => it != null);
    console.log("updatePeriods...", meta.symbolId);
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
        mongo.insertDoc(mongoClient, DB_NAME_OD_TV, "study_report_history", doc1),
        mongo.replaceDoc(mongoClient, DB_NAME_OD_TV, "study_report_latest",
            {"meta.symbolId": meta.symbolId}, doc2),
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
    const map = await findHasReportSymbols(mongoClient)
    const noReportSymbols = [];
    symbolIds.map(it => {
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

async function processSymbol(mongoClient, symbolId) {
    if (!symbolId) {
        console.error("processSymbol skip. symbolId is invalid:", symbolId);
        return;
    }
    console.log("processSymbol start. symbolId:", symbolId);
    return new Promise(async (resolve, reject) => {
        const tvClient = new TradingView.Client({
            DEBUG: true,
        });
        const symbolCtx = {
            meta: {
                symbolId,
                ...utils.splitSymbolId(symbolId)
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
        chart.setMarket(utils.getSymbol(symbolId), symbolCtx.marketOptions);
        chart.onSymbolLoaded(() => {
            // When the symbolId is successfully loaded
            console.log(`Market "${chart.infos.description}" loaded !`);
            saveChartInfo(mongoClient, symbolCtx, chart.infos);
        });

        const indic = await TradingView.getIndicator(strategyInfo.scriptId);
        const STD = new chart.Study(indic);

        let stdDone = false;
        let updateDone = false;
        function  checkResolve(){
            console.log("checkResolve... ")
            if(updateDone && stdDone){
                resolve()
            }else{
                setTimeout(()=>{
                    checkResolve()
                },1000)
            }
        }

        STD.onError((...err) => {
            console.error("Study error:", ...err);
            reject()
        });

        STD.onReady(async () => {
            console.log("processSymbol done. symbolId:", symbolId, " STD:", STD.instance.description);
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
            // if (symbolId_index >= symbolIds.length - 1) {
            //     console.log("process all symbolIds success.");
            //     throw new Error("exit");
            // } else {
            //     await sleep(1000);
            //     processSymbol(mongoClient, symbolId_index + 1);
            // }
        }

        STD.onUpdate(() => {
            onUpdate();
        });
    })
}
