#!/bin/bash

export https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 all_proxy=socks5://127.0.0.1:7897

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "dir: $SCRIPT_DIR"

cd $SCRIPT_DIR"/.."

/Users/jason/.nvm/versions/node/v18.19.0/bin/node --max-old-space-size=8192 \
store/data_collector/collectWithParse.js  \
>> temp/logs/collect.log 2>&1
