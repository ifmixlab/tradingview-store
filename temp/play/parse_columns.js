// const scan_columns_meta = require("../../data/scan_columns_meta.json");
const scan_america_metadata = require("../../data/scan_america_metadata.json");
const fs = require("fs/promises");
const path = require("path");
const {writeFile} = require("../../store/utils/index");
// const scan_column_name_cn = require("../../data/scan_column_name_cn.json");
// const _ = require("lodash");

// const scan_columns_cn_obj = _.keyBy(scan_columns_cn, 'name')

// async function columns_with_cn() {
//     for (const item of scan_columns) {
//         if(!scan_columns_cn_obj[item]){
//             console.log(item);
//             scan_columns_cn.push({
//                 name:item
//             })
//         }
//     }
//     console.log(JSON.stringify(scan_columns_cn))
// }

// function print_columns() {
//     const arr = Object.keys(scan_columns_cn).sort();
//     console.log(JSON.stringify(arr))
// }

// const removeList =["index","component"]

async function getMetaObject() {
    const obj = {}
    for(const f of scan_america_metadata.fields){
        const name = f["n"];
        obj[name] = f;
    }
    return obj;
}


async function update_columns_by_tv_meta(meta) {
    const cols = Object.keys(meta).sort();
    writeFile("../../data/scan_columns.json", cols);
}


async function main() {
    const obj = await getMetaObject();
    await update_columns_by_tv_meta(obj);
}

main()