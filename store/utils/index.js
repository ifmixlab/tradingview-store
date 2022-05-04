module.exports={
    splitSymbol(symbol){
        const splited = symbol.split(":")
        return {
            exchange: splited[0],
            code: splited[1],
        }
    },
    timestampSecond(date){
      return   Math.round(date.getTime()/1000)
    }
}