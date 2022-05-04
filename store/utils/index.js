function  splitTVSymbol(symbol){
    const splited = symbol.split(":")
    return {
        exchange: splited[0],
        code: splited[1],
    }
}
 function splitSymbolId(symbolId){
    const splited = symbolId.split(":")
    return {
        screener:splited[0],
        exchange: splited[1],
        code: splited[2],
    }
}
 function getSymbol(symbolId){
    const {
        exchange,
        code
    } = splitSymbolId(symbolId)
    return `${exchange}:${code}`;
}

 function timestampSecond(date){
    return   Math.round(date.getTime()/1000)
}

module.exports={
    splitTVSymbol,
    splitSymbolId,
    getSymbol,
    timestampSecond
}