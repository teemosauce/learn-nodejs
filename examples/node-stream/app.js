var log = require('../log')
var fs = require('fs')

const entry = __dirname + '/asset/test.js'
const output = __dirname + '/asset/test.build.js'

function getComments() {
    return `
    /**
    *
    * author: yanpengli
    * year: 2019
    * date: ${new Date().toLocaleString()}
    */
`
}
var reader = fs.createReadStream(entry, {
    // encoding: 'utf-8'
});

var jsContent = '';
reader.on('open', () => {
    // log.m("reader open")
})

reader.on('data', data => {
    jsContent += data.toString()
})

reader.on('end', () => {
    // 先删除文件
    fs.unlink(output, err => {
        addComments(jsContent)
    });

})

reader.on('close', () => {
    // log.m("reader close")
})

reader.on('error', err => {
    log.m("reader error", err)
})

/**
 * 把源文件内容加上注释后并写入新的文件
 * @param {*} content 
 */
function addComments(content) {
    var writer = fs.createWriteStream(output, {
        encoding: 'utf-8'
    })
    // 先写入注释
    writer.write(getComments());
    // 写入原来的内容
    writer.end(content);

    writer.on('finish', () => {
        log.m("写入注释信息成功！")
    })

    writer.on('error', error => {
        log.m("writer error", error)
    })
}