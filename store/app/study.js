const TradingView = require("../../main");
const mongo = require("../service/mongo");
const { DB_NAME_OD } = require("../../src/consts");
const { sleep } = require("../../src/utils");

const PAGE_SIZE = 1000000;
const strategyInfo = {
  name: "GetYourTrend",
  version: "1.0",
  scriptId: "PUB;ac51f0ccf0314382ad0fb9b9709ab576",
};

async function main() {
  await mongo.run((client) => process(client));
}

main();

async function savePacket(mongoClient, symbolCtx, data) {
  const doc = {
    ...symbolCtx,
    d: data,
  };
  await mongo.saveDoc(mongoClient, "packet", doc);
  console.log("savePacket done.", JSON.stringify(doc));
}

async function saveChartInfo(mongoClient, symbolCtx, infos) {
  const doc = {
    ...symbolCtx.symbol,
    i: infos,
  };
  await mongo.saveDoc(mongoClient, "chart_info", doc);
  console.log("saveChartInfo done.", JSON.stringify(doc));
}

async function savePeriods(mongoClient, collName, symbolCtx, origin_periods) {
  const periods = JSON.parse(JSON.stringify(origin_periods));
  const docs = periods
    .map((it) => {
      const ti = it.time || it.$time;
      if (ti == null) {
        return null;
      }
      return {
        ...symbolCtx.symbol,
        ...it,
        _id: `${symbolCtx.symbol}_${ti}`,
        pAt: new Date(ti * 1000),
      };
    })
    .filter((it) => it != null);
  console.log("savePeriods...", JSON.stringify(docs));
  mongo.saveManyDoc(mongoClient, collName, docs);
  console.log("savePeriods done.");
}

async function saveStudyReport(mongoClient, collName, symbolCtx, origin_data) {
  const data = JSON.parse(JSON.stringify(origin_data));
  const doc = {
    ...symbolCtx,
    ...data,
  };
  console.log("saveStudyReport...", JSON.stringify(data));
  await mongo.saveDoc(mongoClient, collName, doc);
  console.log("saveStudyReport done.");
}

const symbols = ["NASDAQ:PDD", "NYSE:CPNG"];

async function process(mongoClient) {
  await processSymbol(mongoClient, 0);
}

async function processSymbol(mongoClient, symbol_index) {
  const symbol = symbols[symbol_index];
  if (!symbol) {
    console.error(
      "processSymbol skip. symbol is invalid:",
      symbol,
      " symbol_index:",
      symbol_index
    );
    return;
  }
  console.log("processSymbol start. symbol:", symbol);
  const tvClient = new TradingView.Client({
    DEBUG: true,
  });

  const symbolCtx = {
    symbol,
    pAt: new Date(),
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
  });

  STD.onReady(() => {
    console.log(`STD '${STD.instance.description}' Loaded !`);
  });

  async function onUpdate() {
    await Promise.all([
      savePeriods(mongoClient, "chart_periods", symbolCtx, chart.periods),
      savePeriods(mongoClient, "study_periods", symbolCtx, STD.periods),
      saveStudyReport(
        mongoClient,
        "study_report",
        symbolCtx,
        STD.strategyReport
      ),
    ]);
    // client.end();
    if (symbol_index >= symbols.length - 1) {
      console.log("process all symbols success.");
      throw new Error("exit");
    } else {
      await sleep(1000);
      processSymbol(mongoClient, symbol_index + 1);
    }
  }

  STD.onUpdate(() => {
    onUpdate();
  });
}
