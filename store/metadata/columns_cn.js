const scan_columns_cn = require("../../data/scan_columns_cn.json");
const scan_america_metadata = require("../../data/scan_america_metadata.json");
const fs = require("fs/promises");
// const scan_column_name_cn = require("../../data/scan_column_name_cn.json");
// const _ = require("lodash");

// const scan_columns_cn_obj = _.keyBy(scan_columns_cn, 'name')

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

function print_columns() {
    const arr = Object.keys(scan_columns_cn).sort();
    console.log(JSON.stringify(arr))
}

const removeList =["index","component"]

async function diff_with_meta() {
    for(const f of scan_america_metadata.fields){
        const name = f["n"];
        if(!scan_columns_cn[name]){
            const realName = name.split("|")[0];
            if(!scan_columns_cn[realName] && !removeList.includes(realName)){
                scan_columns_cn[realName] = {
                    name:realName
                };
            }
        }
    }
    const newNames = Object.keys(scan_columns_cn);
    console.log("newNames count:",newNames.length)
    await fs.writeFile("../../data/scan_columns_cn2.json",JSON.stringify(scan_columns_cn))
}

async function main() {
    // await columns_with_cn();
    // console.log(JSON.stringify(scan_columns_cn_obj))
    // print_columns()
    await diff_with_meta();
}

main()