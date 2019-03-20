var log = require('../log')
var fs = require('fs')

var comments = `
    /**
    *
    * author: yanpengli
    * year: 2019
    */
`

var reader = fs.createReadStream(__dirname + '/asset/test.js', {
    // encoding: 'utf-8'
});

var jsContent = '';
reader.on('open', () => {
    log.m("reader open")
})

reader.on('data', data => {
    jsContent += data.toString()
})

reader.on('end', () => {
    addComments(jsContent)
})

reader.on('close', () => {
    log.m("reader close")
})

reader.on('error', err => {
    log.m("reader error", err)
})

/**
 * 把源文件内容加上注释后并写入新的文件
 * @param {*} content 
 */
function addComments(content) {
    var newContents = comments + content;

    var writer = fs.createWriteStream(__dirname + '/build/test.comment.js', {
        encoding: 'utf-8'
    })
    writer.write(newContents);
    writer.end();

    writer.on('finish', () => {
        log.m("writer finish")
    })

    writer.on('error', error => {
        log.m("writer error", error)
    })
}