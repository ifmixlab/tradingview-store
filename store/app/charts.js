const TradingView = require('../../main');
const mongo = require("../service/mongo")
const {tvEventTypes,db_name_od_tv,db_name_log_tv} = require("../../src/consts");

const PAGE_SIZE = 100

async function main() {
    await mongo.run((client) => process(client))
}

main()

async function savePacket(mongoClient, params, data) {
    const time = new Date()
    const coll = mongoClient.db(db_name_log_tv).collection("packet");
    const doc = {
        t: time,
        p: params,
        d: data
    }
    const res = await coll.insertOne(doc)
    console.log("savePacket done.",JSON.stringify(doc))
}

async function saveChartInfo(mongoClient, params, chart) {
    console.log(JSON.stringify(chart.periods));
    const time = new Date()
    const coll = mongoClient.db(db_name_od_tv).collection("chart_info");
    const doc = {
        t: time,
        p: params,
        i:chart.infos,
    }
    const res = await coll.insertOne(doc)
    console.log("saveChartInfo done.",JSON.stringify(doc))
}

async function saveChartPeriods(mongoClient, params, chart) {
    console.log(JSON.stringify(chart.periods));
    const time = new Date()
    const coll = mongoClient.db(db_name_od_tv).collection("chart_periods");
    const periods = JSON.parse(JSON.stringify(chart.periods))
    periods.forEach(it=>{
        it.t=new Date(it.time*1000)
    })
    const doc = {
        t: time,
        p: params,
        d: periods
    }
    const res = await coll.insertOne(doc)
    console.log("saveChartPeriods done.",JSON.stringify(doc))
}

const symbols = ["NASDAQ:PDD","NYSE:CPNG"]

async function process(mongoClient) {
    await processSymbol(mongoClient,0)
}

async function processSymbol(mongoClient,symbol_index) {
    const symbol = symbols[symbol_index]
    if(!symbol){
        console.error("processSymbol skip. symbol is invalid:",symbol," symbol_index:",symbol_index)
        return
    }
    console.log("processSymbol start. symbol:",symbol)
    const tvClient = new TradingView.Client({
        DEBUG: true
    });
    let series_completed = false;
    const params = {
        symbol,
        options: { // Set the market
            timeframe: 'D',
            currency:'USD',
            range:PAGE_SIZE
        }
    }
    tvClient.onPacket((data) => {
        savePacket(mongoClient, params, data)
    })
    const chart = new tvClient.Session.Chart(); // Init a Chart session
    chart.setTimezone('Asia/Shanghai');
    chart.setMarket(symbol, params.options);

    chart.onError((...err) => { // Listen for errors (can avoid crash)
        console.error('Chart error:', ...err);
        // Do something...
    });

    chart.onSymbolLoaded(() => { // When the symbol is successfully loaded
        console.log(`Market "${chart.infos.description}" loaded !`);
        saveChartInfo(mongoClient,params,chart)
    });

    chart.onUpdate(() => { // When price changes
        saveChartPeriods(mongoClient,params,chart)
        if(!series_completed){
            console.log("fetchMore >>> ")
            chart.fetchMore(PAGE_SIZE)
        }else{
            if(symbol_index+1  < symbols.length){
                processSymbol(mongoClient,symbol_index+1);
            }else{
                console.log("process all symbols success.")
                throw new Error("exit")
            }
        }
    });

    chart.onTVEvent(tvEventTypes.series_completed,(packet)=>{
        series_completed = true;
    })
}


