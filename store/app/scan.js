const TradingView = require("../../main");
const mongo = require("../service/mongo");
const scan_stock_columns = require("../../data/scan_stock_columns.json")
const scan_crypto_columns = require("../../data/scan_crypto_columns.json")

async function main() {
    await mongo.run((client) => mainProcess(client));
    process.exit(-1)
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

async function processType(mongoClient, type, columns) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("processType start. type:",type)
    // const res = await TradingView.fetchScanData(
    //   ["NASDAQ:LTRPB", "NYSE:MMU"],
    //   "america",
    //   allColumns
    // );
    const res = await TradingView.fetchScanDataForAllSymbols(
        type,
        columns
    );
    if(res==null || res.data == null){
        console.error("fetch error, res or res.data is null. ",JSON.stringify(res))
        return;
    }
    const docs = res.data
        .map((it) => {
            if (it.d.length !== columns.length) {
                return null;
            }
            const obj = {};
            for (let index = 0; index < columns.length; index++) {
                const colName = columns[index];
                const value = it.d[index];
                obj[colName] = value;
            }
            obj.symbol = it.s;
            obj.pAt = new Date();
            // console.log("doc: ", JSON.stringify(obj));
            return obj;
        })
        .filter((it) => it != null);
    await mongo.saveManyDoc(mongoClient, `scan_${type}`, docs);
    console.log("processType done. type:",type)
}
