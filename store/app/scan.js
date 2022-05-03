const TradingView = require("../../main");
const mongo = require("../service/mongo");
const {DB_NAME_OD} = require("../../src/consts");

const allColumns = [
    "Recommend.Other",
    "Recommend.All",
    "Recommend.MA",
    "RSI",
    "RSI[1]",
    "Stoch.K",
    "Stoch.D",
    "Stoch.K[1]",
    "Stoch.D[1]",
    "CCI20",
    "CCI20[1]",
    "ADX",
    "ADX+DI",
    "ADX-DI",
    "ADX+DI[1]",
    "ADX-DI[1]",
    "AO",
    "AO[1]",
    "AO[2]",
    "Mom",
    "Mom[1]",
    "MACD.macd",
    "MACD.signal",
    "Rec.Stoch.RSI",
    "Stoch.RSI.K",
    "Rec.WR",
    "W.R",
    "Rec.BBPower",
    "BBPower",
    "Rec.UO",
    "UO",
    "EMA10",
    "close",
    "SMA10",
    "EMA20",
    "SMA20",
    "EMA30",
    "SMA30",
    "EMA50",
    "SMA50",
    "EMA100",
    "SMA100",
    "EMA200",
    "SMA200",
    "Rec.Ichimoku",
    "Ichimoku.BLine",
    "Rec.VWMA",
    "VWMA",
    "Rec.HullMA9",
    "HullMA9",
    "Pivot.M.Classic.S3",
    "Pivot.M.Classic.S2",
    "Pivot.M.Classic.S1",
    "Pivot.M.Classic.Middle",
    "Pivot.M.Classic.R1",
    "Pivot.M.Classic.R2",
    "Pivot.M.Classic.R3",
    "Pivot.M.Fibonacci.S3",
    "Pivot.M.Fibonacci.S2",
    "Pivot.M.Fibonacci.S1",
    "Pivot.M.Fibonacci.Middle",
    "Pivot.M.Fibonacci.R1",
    "Pivot.M.Fibonacci.R2",
    "Pivot.M.Fibonacci.R3",
    "Pivot.M.Camarilla.S3",
    "Pivot.M.Camarilla.S2",
    "Pivot.M.Camarilla.S1",
    "Pivot.M.Camarilla.Middle",
    "Pivot.M.Camarilla.R1",
    "Pivot.M.Camarilla.R2",
    "Pivot.M.Camarilla.R3",
    "Pivot.M.Woodie.S3",
    "Pivot.M.Woodie.S2",
    "Pivot.M.Woodie.S1",
    "Pivot.M.Woodie.Middle",
    "Pivot.M.Woodie.R1",
    "Pivot.M.Woodie.R2",
    "Pivot.M.Woodie.R3",
    "Pivot.M.Demark.S1",
    "Pivot.M.Demark.Middle",
    "Pivot.M.Demark.R1",
];

async function main() {
    await mongo.run((client) => mainProcess(client));
    process.exit(-1)
}

main();

async function mainProcess(mongoClient, type) {
    await processType(mongoClient, "crypto")
    // await processType(mongoClient, "america")
}

async function processType(mongoClient, type) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("mainProcess start.")
    // const res = await TradingView.fetchScanData(
    //   ["NASDAQ:LTRPB", "NYSE:MMU"],
    //   "america",
    //   allColumns
    // );
    const res = await TradingView.fetchScanDataForAllSymbols(
        type,
        allColumns
    );
    const docs = res.data
        .map((it) => {
            if (it.d.length !== allColumns.length) {
                return null;
            }
            const obj = {};
            for (let index = 0; index < allColumns.length; index++) {
                const colName = allColumns[index];
                const value = it.d[index];
                obj[colName] = value;
            }
            obj.symbol = it.s;
            obj.t = new Date();
            console.log("doc: ", JSON.stringify(obj));
            return obj;
        })
        .filter((it) => it != null);
    await mongo.saveManyDoc(mongoClient, `scan_${type}`, docs);
    console.log("mainProcess success.")
}
