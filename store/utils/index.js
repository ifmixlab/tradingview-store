const path = require("path");
const fs = require("fs/promises");

function  splitTVSymbol(symbol){
    const splited = symbol.split(":")
    return {
        exchange: splited[0],
        code: splited[1],
    }
}

 function timestampSecond(date){
    return   Math.round(date.getTime()/1000)
}

async function writeFile(file_path,data) {
    const f = path.resolve(__dirname,file_path);
    console.log("writeFile:",f)
    await fs.writeFile(f, JSON.stringify(data,null,2))
}

module.exports={
    writeFile,
    splitTVSymbol,
    timestampSecond
}