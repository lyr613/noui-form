const fs = require('fs')
const path = require('path')
const pkg = require('../package.json')

re_write_version()

function re_write_version() {
    const ver = pkg.version

    console.log('version', ver)
    const ver_arr = ver.split('.')

    const txt = fs.readFileSync(path.resolve(__dirname, '../src/infor.ts'), 'utf-8')
    const reg = /\[\d+,\s*\d+,\s*\d+\]/
    const txt2 = txt.replace(reg, '[' + ver_arr.join(', ') + ']')
    fs.writeFileSync(path.resolve(__dirname, '../src/infor.ts'), txt2)
}
