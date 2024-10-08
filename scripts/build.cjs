const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const root_dir = path.resolve(__dirname, '..')

// 清空dist文件夹
if (fs.existsSync(path.resolve(root_dir, 'dist'))) {
    fs.rmSync(path.resolve(root_dir, 'dist'), { recursive: true })
}

// 执行tsc编译
cp.execSync('npx tsc --project tsconfig.esm.json ', { stdio: 'inherit' })
cp.execSync('npx tsc --project tsconfig.cjs.json ', { stdio: 'inherit' })
cp.execSync('npx tsc --project tsconfig.types.json', { stdio: 'inherit' })
