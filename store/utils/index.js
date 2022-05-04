function  splitTVSymbol(symbol){
    const splited = symbol.split(":")
    return {
        exchange: splited[0],
        code: splited[1],
    }
}
 function  splitSymbol(symbol){
    const splited = symbol.split(":")
    return {
        screener:splited[0],
        exchange: splited[1],
        code: splited[2],
    }
}
 function getExchangeCodeSymbol(symbol){
    const {
        screener,
        exchange,
        code
    } = splitSymbol(symbol)
    return `${exchange}:${code}`;
}
 function timestampSecond(date){
    return   Math.round(date.getTime()/1000)
}

module.exports={
    splitTVSymbol,
    splitSymbol,
    getExchangeCodeSymbol,
    timestampSecond
}