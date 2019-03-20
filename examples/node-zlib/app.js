var fs = require('fs')
var zlib = require('zlib')

var txtName = '/assets/test.txt'
var gzName = txtName + '.gz'

//1. 压缩文件
// gzip()

//2. 解压缩文件
// ungzip()

//3. 压缩文本
// var str = gzipContent("李彦朋");
// console.log("压缩文本>>>>>>>", str)

//4. 解压缩文件
// console.log("解压缩文本>>>>>>>", ungzipContent(str))

/**
 * 压缩
 */
function gzip() {
    var read = fs.createReadStream(__dirname + txtName)
    var write = fs.createWriteStream(__dirname + gzName)

    read.pipe(zlib.createGzip()).pipe(write)

    read.on('error', err => {
        console.log(err)
    })
}

/**
 * 解压缩
 */
function ungzip() {
    var read = fs.createReadStream(__dirname + gzName);

    var unzip = zlib.createUnzip()
    read.pipe(unzip)

    var str = '';
    unzip.on('open', () => {
        console.log("unzip open")
    })

    unzip.on('data', data => {
        str += data.toString()
        console.log("unzip data", data)
    })

    unzip.on('end', () => {
        console.log("unzip str", str)
    })

}

/**
 * 压缩内容
 * @param {要压缩的文本} content 
 */
function gzipContent(content) {
    var buffer = zlib.deflateSync(content)
    return buffer.toString('base64')
}

/**
 * 解压缩内容
 * @param {压缩内容} content 
 */
function ungzipContent(content) {
    var buffer = Buffer.from(content, 'base64')
    return zlib.unzipSync(buffer).toString()
}