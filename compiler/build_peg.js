const util = require('util');
const child_process = require('child_process');
const exec = util.promisify(child_process.exec);
const fs = require('fs');
const path = require('path');
const readDir = fs.readdirSync('./peg_parser/src/');
const catalog = fs.readdirSync('./peg_parser/');

if (catalog.indexOf('dist')>-1) {
    exec('rm -rf peg_parser/dist');
}

exec('mkdir peg_parser/dist')

const pegTransJs = async function () {
    if (readDir.length) {
        for (let item of readDir) {
            let name = path.basename(item, '.peg');
            await exec('pegjs -o peg_parser/dist/' + name + '.js peg_parser/src/' + item);
        }
    }
}

pegTransJs();