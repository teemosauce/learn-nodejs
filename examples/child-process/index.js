const fs = require('fs')
const path = require('path')
console.log('子进程开始执行...')
let logPath = path.resolve(__dirname, 'a.txt')
let start = Date.now()
let writer = fs.createWriteStream(logPath, {
    flags: 'w'
})


for (let i = 0; i < 600000; i++) {
    writer.write(i + '')
}
writer.end()

writer.on('close', () => {
    console.log('子进程写入文件完成 总耗时：' + Math.round((Date.now() - start) / 1000) + 's')

    process.send('来自子进程发来的消息')
})

console.log('子进程同步任务执行结束')

