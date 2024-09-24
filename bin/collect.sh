#!/bin/sh
export https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 all_proxy=socks5://127.0.0.1:7897

/Users/jason/.nvm/versions/node/v18.19.0/bin/node --max-old-space-size=8192 \
/Users/jason/fin/analysis/tradingview-store/store/data_collector/collectWithParse.js  \
>> /Users/jason/fin/analysis/tradingview-store/temp/logs/collect.log 2>&1
