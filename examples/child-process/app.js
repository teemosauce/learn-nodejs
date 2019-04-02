const cp = require('child_process')
const path = require('path')

console.log('主进程运行开始...')

console.log('创建子进程任务')
let child = cp.fork(path.resolve(__dirname, 'index.js'))

console.log('主进程继续执行任务')

child.on('message', message => {
    console.log('---------------主进程打印---------------')
    console.log(message)
})


cp.exec('npm install', (err, stdout, stderr) => {
    if (err) {
        return console.log('异常：', err)
    }

    console.log("out", stdout)

    console.log("error", stderr)
})