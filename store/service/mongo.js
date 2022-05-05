const {MongoClient} = require("mongodb");
const {DB_NAME_OD_TV} = require("../../src/consts")

const uri = "mongodb://127.0.0.1:27017/od_tv?readPreference=primary&ssl=false";
const dot = require('dot-object');

const client = new MongoClient(uri);

let connected = false;

function fixFieldNameForMongo(origin_doc){
    console.log("fixFieldNameForMongo, origin_doc: ", JSON.stringify(origin_doc));
    const row = dot.dot(origin_doc);
    const newDoc = {}
    const keys = Object.keys(row)
    for(key of keys){
        const newKey = getMongoKey(key)
        newDoc[newKey] = row[key]
    }
    return newDoc;
}

function getMongoKey(key){
    return key.replace(/\$/g,"_dollar_")
        .replace(/\./g,"_dot_")
}

function testFixFieldNameForMongo(){
    const doc ={
        '$id': 2,
        'contact.name.first': 'John',
        'contact.name.last': 'Doe',
        'contact.$email': 'example@gmail.com',
        'contact.info.about.me': 'classified',
        "arrA":[
            0,1,2
        ],
        "devices":2,
        'devices[0]': 'mobile',
        'devices[1]': 'laptop',
        'some.other.(things).0': 'this',
        'some.other.things.1': 'that'
    }
    const doc2 = {"meta":{"symbol":"HKEX:1503","market":"hongkong","exchange":"HKEX","code":"1503"},"logoid":"","name":"1503","beta_1_year":0.29256472,"Low.3M":2.56,"Perf.3M":-4.71014493,"High.3M":2.9,"Low.6M":2.46,"Perf.6M":-4.36363636,"High.6M":2.9,"price_52_week_low":2.46,"price_52_week_high":3.04,"Aroon.Down":85.71428571,"Aroon.Up":21.42857143,"ADR":0.03785714,"CCI20":-67.15328467,"ebitda":433532580,"MACD.macd":-0.03702967,"MACD.signal":-0.03146113,"ROC":-1.12781955,"RSI7":36.72952438,"RSI":37.61921653,"Stoch.D":32.67806268,"Stoch.K":44.44444444,"Stoch.RSI.K":48.99547208,"Stoch.RSI.D":35.58225422,"Ichimoku.Lead1":2.7,"Ichimoku.Lead2":2.715,"Ichimoku.BLine":2.73,"Ichimoku.CLine":2.625,"exchange":"HKEX","change_from_open_abs":0.01,"change_from_open":0.38167939,"price_free_cash_flow_ttm":null,"enterprise_value_ebitda_ttm":10.9568,"enterprise_value_fq":null,"debt_to_equity":0.55150582,"net_debt":1805278290.34966,"after_tax_margin":52.59665884,"net_income":322636177.092863,"Mom":-0.05,"AO":-0.09814706,"Perf.W":0.76628352,"Low.All":2.03,"High.All":3.42,"last_annual_revenue":613217358.492252,"ADX-DI":29.43912505,"revenue_per_employee":null,"number_of_employees":null,"Volatility.W":1.641825,"DonchCh20.Upper":2.9,"DonchCh20.Lower":2.56,"goodwill":0,"country":"Hong Kong","basic_eps_net_income":0.2861,"earnings_per_share_basic_ttm":0.2861,"W.R":-53.33333333,"earnings_release_next_date":1661169600,"dividends_paid":null,"total_shares_outstanding_fundamental":1127820000,"price_book_ratio":0.60514163,"price_book_fq":null,"market_cap_basic":2966165304,"price_earnings_ttm":9.19259,"price_revenue_ttm":4.83566368,"price_sales_ratio":4.8370539,"BB.upper":2.85721244,"BB.lower":2.52278756,"average_volume_10d_calc":553634.2,"average_volume_30d_calc":1198177.43333333,"average_volume_60d_calc":1081226.66666667,"average_volume_90d_calc":1043016.4,"ADX":36.60718235,"Perf.YTD":0.76628352,"Perf.Y":-1.12781955,"open":2.62,"total_revenue":613217358.492252,"total_current_assets":null,"total_liabilities_fy":4351132602.21077,"total_debt":2703264133.0697403,"total_liabilities_fq":4351132602.21077,"total_assets":9252738407.50939,"VWAP":2.63333333,"VWMA":2.74579969,"return_on_invested_capital":5.41202122,"P.SAR":2.70408834,"EMA5":2.62771679,"EMA10":2.6409214,"EMA20":2.67245606,"EMA30":2.69117766,"EMA50":2.70701125,"EMA100":2.71677352,"EMA200":2.71892369,"Recommend.Other":0,"last_annual_eps":0.2861,"earnings_per_share_fq":0.147308,"earnings_per_share_diluted_ttm":0.2861,"relative_volume_intraday|5":null,"low":2.62,"earnings_release_date":1647959160,"high":2.65,"Low.1M":2.56,"Volatility.M":1.31740278,"Perf.1M":-8.04195804,"High.1M":2.9,"Pivot.M.Demark.Middle":2.68,"Pivot.M.Demark.R1":2.76,"Pivot.M.Demark.S1":2.46,"Pivot.M.Woodie.Middle":2.685,"Pivot.M.Woodie.R1":2.77,"Pivot.M.Woodie.R2":2.985,"Pivot.M.Woodie.R3":3.07,"Pivot.M.Woodie.S1":2.47,"Pivot.M.Woodie.S2":2.385,"Pivot.M.Woodie.S3":2.17,"Pivot.M.Camarilla.Middle":2.70666667,"Pivot.M.Camarilla.R1":2.6475,"Pivot.M.Camarilla.R2":2.675,"Pivot.M.Camarilla.R3":2.7025,"Pivot.M.Camarilla.S1":2.5925,"Pivot.M.Camarilla.S2":2.565,"Pivot.M.Camarilla.S3":2.5375,"Pivot.M.Fibonacci.Middle":2.70666667,"Pivot.M.Fibonacci.R1":2.82126667,"Pivot.M.Fibonacci.R2":2.89206667,"Pivot.M.Fibonacci.R3":3.00666667,"Pivot.M.Fibonacci.S1":2.59206667,"Pivot.M.Fibonacci.S2":2.52126667,"Pivot.M.Fibonacci.S3":2.40666667,"Pivot.M.Classic.Middle":2.70666667,"Pivot.M.Classic.R1":2.81333333,"Pivot.M.Classic.R2":3.00666667,"Pivot.M.Classic.R3":3.30666667,"Pivot.M.Classic.S1":2.51333333,"Pivot.M.Classic.S2":2.40666667,"Pivot.M.Classic.S3":2.10666667,"ADX+DI":11.45526876,"earnings_per_share_forecast_next_fq":null,"dps_common_stock_prim_issue_fy":0.2541,"dividends_per_share_fq":null,"gross_profit":514537096.154758,"gross_profit_fq":null,"gross_margin":83.90683085,"Volatility.D":1.14503817,"current_ratio":null,"float_shares_outstanding":581289706.1999999,"change_abs|1":0,"change_abs|1M":0.01,"change_abs|1W":0.01,"change_abs|60":0,"change_abs|240":0,"change_abs|5":0,"change_abs|15":0,"change|1":0,"change|1M":0.38167939,"change|1W":0.38167939,"change|60":0,"change|240":0,"change|5":0,"change|15":0,"BBPower":-0.03295919,"premarket_low":null,"premarket_open":null,"premarket_volume":null,"premarket_change":null,"premarket_change_abs":null,"premarket_change_from_open":null,"premarket_change_from_open_abs":null,"premarket_close":null,"premarket_gap":null,"premarket_high":null,"postmarket_low":null,"postmarket_change":null,"postmarket_open":null,"postmarket_volume":null,"postmarket_close":null,"postmarket_change_abs":null,"postmarket_high":null,"relative_volume_10d_calc":0.63516648,"ATR":0.04291516,"Recommend.MA":-0.8,"pre_tax_margin":75.94226152,"SMA5":2.622,"SMA10":2.632,"SMA20":2.69,"SMA30":2.72966667,"SMA50":2.7198,"SMA100":2.7042,"SMA200":2.74855,"UO":45.13917644,"number_of_shareholders":null,"dividend_yield_recent":9.661596,"return_on_equity":6.76568377,"KltChnl.upper":2.71565525,"KltChnl.lower":2.62925686,"HullMA9":2.62318519,"operating_margin":70.6560689,"ChaikinMoneyFlow":-0.1189972,"industry":"Real Estate Investment Trusts","return_on_assets":3.62540303,"MoneyFlow":29.51099983,"gap":-0.38022814,"quick_ratio":null,"change":0,"change_abs":0,"sector":"Finance","close":2.63,"volume":354000,"Value.Traded":931020,"Recommend.All":-0.4,"description":"CHINA MERCHANTS COMMERCIAL REIT","type":"fund","subtype":"reit","update_mode":"delayed_streaming_900","CCI20[1]":-75.53865653,"RSI7[1]":36.72952438,"RSI[1]":37.61921653,"Stoch.K[1]":34.01709402,"Stoch.D[1]":20.68376068,"Rec.Stoch.RSI":0,"Rec.Ichimoku":0,"pricescale":100,"minmov":1,"fractional":"false","minmove2":0,"Mom[1]":-0.07,"AO[1]":-0.10161765,"AO[2]":-0.10241176,"Rec.WR":0,"ADX+DI[1]":10.30543024,"ADX-DI[1]":30.98634783,"Candle.3BlackCrows":0,"Candle.HangingMan":0,"Candle.InvertedHammer":1,"Candle.Marubozu.White":0,"Candle.Marubozu.Black":0,"Candle.Doji":0,"Candle.MorningStar":0,"Candle.Doji.Gravestone":0,"Candle.ShootingStar":0,"Candle.3WhiteSoldiers":0,"Candle.SpinningTop.White":0,"Candle.TriStar.Bullish":0,"Candle.Kicking.Bullish":0,"Candle.Engulfing.Bullish":0,"Candle.Harami.Bullish":0,"Candle.AbandonedBaby.Bullish":0,"Candle.TriStar.Bearish":0,"Candle.Kicking.Bearish":0,"Candle.Engulfing.Bearish":0,"Candle.Harami.Bearish":0,"Candle.AbandonedBaby.Bearish":0,"Candle.Doji.Dragonfly":0,"Candle.Hammer":0,"Candle.LongShadow.Upper":0,"Candle.LongShadow.Lower":0,"Candle.EveningStar":0,"Candle.SpinningTop.Black":0,"Rec.VWMA":-1,"Rec.BBPower":0,"Rec.UO":0,"Rec.HullMA9":1,"currency":"HKD","fundamental_currency_code":"HKD","average_volume":553634.2,"beta_3_year":0.8273917,"beta_5_year":0.8273917,"debt_to_assets":null,"dividends_yield":9.661596,"long_term_capital":null,"market_cap_calc":2966165304,"preferred_dividends":null,"return_of_invested_capital_percent_ttm":5.41202122,"submarket":"","is_primary":true,"eps_surprise_fq":null,"eps_surprise_percent_fq":null,"total_capital":null,"relative_volume":0.63941137,"pre_change":null,"post_change":null,"price_earnings_to_growth_ttm":null,"price_sales":4.83705583,"total_shares_outstanding":1127820000,"debt_to_equity_fq":0.55150582,"ts":"2022-05-05T16:18:37.830Z"}
    const newDoc = fixFieldNameForMongo(doc)
    console.log(JSON.stringify(newDoc))
}
testFixFieldNameForMongo()

async function insertDoc(mongoClient,dbName, collName, origin_doc) {
    const doc = fixFieldNameForMongo(origin_doc)
    try {
        // console.log("insertDoc, collName: ", collName, " doc: ", JSON.stringify(doc));
        const coll = mongoClient.db(dbName).collection(collName);
        const res = await coll.insertOne(doc);
        console.log("insertDoc done. collName: ", collName);
        return res;
    } catch (e) {
        console.error("insertDoc error. collName: ", collName, doc, e);
    }
}

async function replaceDoc(mongoClient,dbName, collName,filter, origin_doc) {
    const doc = fixFieldNameForMongo(origin_doc)
    try {
        const coll = mongoClient.db(dbName).collection(collName);
        const res = await coll.replaceOne(filter, doc, {
            upsert: true
        });
        console.log("replaceDoc done. collName: ", collName);
        return res;
    } catch (e) {
        console.error("replaceDoc error. collName: ", collName, doc, e);
    }
}

async function insertManyDocs(mongoClient, dbName,collName, origin_docs) {
    const docs = origin_docs.map(it=>fixFieldNameForMongo(it))
    try {
        console.log(
            "insertManyDocs, collName: ",
            collName,
            " docs.length: ",
            docs.length
        );
        const coll = mongoClient.db(dbName).collection(collName);
        const res = await coll.insertMany(docs, {bypassDocumentValidation:true,ordered: false});
        console.log("insertManyDocs done. collName: ", collName);
        return res;
    } catch (e) {
        console.error("insertManyDocs error. collName: ", collName, docs, e);
    }
}

async function bulkWrite(mongoClient, collName, ops) {
    try {
        console.log(
            "bulkWrite, collName: ",
            collName,
            " ops.length: ",
            ops.length
        );
        const coll = mongoClient.db(DB_NAME_OD_TV).collection(collName);
        const res = await coll.bulkWrite(ops, {bypassDocumentValidation: true, ordered: false})
        console.log("bulkWrite done. collName: ", collName);
        return res;
    } catch (e) {
        console.error("bulkWrite error. collName: ", collName, e);
    }
}

async function getClient() {
    if (connected) {
        return client;
    }
    await client.connect();
    connected = true;
    return client;
}

async function run(process) {
    const mongoClient = await getClient();
    await mongoClient.connect();
    try {
        await process(mongoClient);
    } catch (e) {
        console.error("process error. ", e);
    } finally {
        console.log("mongo run done.");
        // await mongoClient.close()
    }
}

module.exports = {
    getClient,
    fixFieldNameForMongo,
    run,
    insertDoc,
    replaceDoc,
    insertManyDocs,
    bulkWrite,
};
