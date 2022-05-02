const TradingView = require('../../main');
const mongo = require("../service/mongo")

async function insert(mongoClient, params, data) {
    const time = new Date()
    const coll = mongoClient.db("od_tv").collection("res_test");
    const doc = {
        t: time,
        p: params,
        d: data
    }
    const res = await coll.insertOne(doc)
    console.log("insert done. id:", res.insertedId)
}

async function process(mongoClient) {
    const tvClient = new TradingView.Client({
        DEBUG: true
    });
    const params = {
        symbol: 'BINANCE:BTCEUR',
        options: { // Set the market
            timeframe: 'D',
        }
    }
    tvClient.onPacket((data) => {
        insert(mongoClient, params, data)
    })
    const chart = new tvClient.Session.Chart(); // Init a Chart session
    chart.setMarket(params.symbol, params.options);

    chart.onError((...err) => { // Listen for errors (can avoid crash)
        console.error('Chart error:', ...err);
        // Do something...
    });

    chart.onSymbolLoaded(() => { // When the symbol is successfully loaded
        console.log(`Market "${chart.infos.description}" loaded !`);
    });

    chart.onUpdate(() => { // When price changes
        console.log(JSON.stringify(chart.periods));
        if (!chart.periods[0]) return;
        console.log(`[${chart.infos.description}]: ${chart.periods[0].close} ${chart.infos.currency_id}`);
        // Do something...
    });
}

async function main() {
    const mongoClient = await mongo.getClient();
    await mongoClient.connect()
    try {
      await  process(mongoClient)
    } catch (e) {
        console.error("process error. ", e)
    } finally {
      // await mongoClient.close()
    }
}

main()