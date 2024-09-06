const fs = require('fs')
const path = require('path')
const cp = require('child_process')

const root_dir = path.resolve(__dirname, '..')

// 清空dist文件夹
if (fs.existsSync(path.resolve(root_dir, 'dist'))) {
    fs.rmSync(path.resolve(root_dir, 'dist'), { recursive: true })
}

// 执行tsc编译
cp.execSync('npx tsc', { stdio: 'inherit' })

// 复制 d.ts 文件
const files = fs.readdirSync(path.resolve(root_dir, 'src'))
files.forEach((file) => {
    if (file.endsWith('.d.ts')) {
        fs.copyFileSync(path.resolve(root_dir, 'src', file), path.resolve(root_dir, 'dist', file))
    }
})
