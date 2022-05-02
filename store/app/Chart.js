const TradingView = require('../../main');
const mongo = require("../service/mongo")
const {tvEventTypes} = require("../../src/consts");

const PAGE_SIZE = 100
async function main() {
    await mongo.run((client) => process(client))
}

main()

async function savePacket(mongoClient, params, data) {
    const time = new Date()
    const coll = mongoClient.db("od_tv_test").collection("response");
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
    const coll = mongoClient.db("od_tv_test").collection("chart_info");
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
    const coll = mongoClient.db("od_tv_test").collection("chart_periods");
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

async function process(mongoClient) {
    const tvClient = new TradingView.Client({
        DEBUG: true
    });
    let series_completed = false;
    const params = {
        symbol: "NASDAQ:PDD",
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
    chart.setMarket(params.symbol, params.options);

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
        }
    });

    chart.onTVEvent(tvEventTypes.series_completed,(packet)=>{
        series_completed = true;
    })
}


