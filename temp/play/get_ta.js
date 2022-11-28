const {fetchScanData} = require("../../src/miscRequests")
const request = require("../../src/request")
const scan_columns = require("../../data/scan_columns.json");
const {writeFile} = require("../../store/utils/index");
const path = require("path");

async function getTA(screener, id, cols) {
    const advice = {};

    // const cols = ['1', '5', '15', '60', '240', '1D', '1W', '1M']
    //   .map((t) => indicators.map((i) => (t !== '1D' ? `${i}|${t}` : i)))
    //   .flat();

    const rs = await fetchScanData([id], screener, cols);
    if (!rs.data || !rs.data[0]) return false;

    rs.data[0].d.forEach((val, i) => {
      const [name, period] = cols[i].split('|');
      const pName = period || '1D';
      if (!advice[pName]) advice[pName] = {};
      advice[pName][name.split('.').pop()] = Math.round(val * 1000) / 500;
    });

    return advice;
  }

async function runTA(){
    const res = await getTA("america",  "NASDAQ:AAPL",scan_columns);
    writeFile("./ta.json", res);
}


async function main(){
    await runTA()
}

main()