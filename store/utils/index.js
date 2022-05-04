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

module.exports={
    splitTVSymbol,
    timestampSecond
}