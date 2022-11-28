const scan_columns_meta = require("../../data/scan_columns_meta.json");
// const scan_america_metadata = require("../../data/scan_america_metadata.json");
const fs = require("fs/promises");
const path = require("path");
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

// async function diff_with_meta() {
//     for(const f of scan_america_metadata.fields){
//         const name = f["n"];
//         if(!scan_columns_cn[name]){
//             const realName = name.split("|")[0];
//             if(!scan_columns_cn[realName] && !removeList.includes(realName)){
//                 scan_columns_cn[realName] = {
//                     name:realName
//                 };
//             }
//         }
//     }
//     const newNames = Object.keys(scan_columns_cn);
// console.log("newNames count:",newNames.length)
// }

async function clean() {
    console.log("clean start")

    const newObj = {}
    for (const key of Object.keys(scan_columns_meta)) {
        const v = scan_columns_meta[key];
        if(key.includes("|")){
            console.log(`skip ${key}`);
        }else{
            newObj[key] = v;
        }
    }
    writeFiles(newObj);
    return newObj;
}

async function writeFiles(data) {
    const f = path.resolve(__dirname,"../../data/scan_columns_meta.json");
    console.log("writeFiles",f)
    await fs.writeFile(f, JSON.stringify(data,null,2))
}

async function main() {
    // await columns_with_cn();
    // console.log(JSON.stringify(scan_columns_cn_obj))
    // print_columns()
    await clean();
}

main()