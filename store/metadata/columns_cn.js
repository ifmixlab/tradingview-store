const scan_columns_cn = require("../../data/scan_columns_cn.json");
const scan_columns = require("../../data/scan_columns.json");
// const scan_column_name_cn = require("../../data/scan_column_name_cn.json");
const _ = require("lodash");

const scan_columns_cn_obj = _.keyBy(scan_columns_cn, 'name')

async function columns_with_cn() {
    for (const item of scan_columns) {
        if(!scan_columns_cn_obj[item]){
            console.log(item);
            scan_columns_cn.push({
                name:item
            })
        }
    }
    console.log(JSON.stringify(scan_columns_cn))
}

async function main() {
    await columns_with_cn();
}

main()