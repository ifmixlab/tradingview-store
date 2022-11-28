const {getTA} = require("../../src/miscRequests")


async function runTA(){
    const res = await getTA("america",  "NASDAQ:AAPL");
    console.log(res)
}


async function main(){
    await runTA()

}


main()