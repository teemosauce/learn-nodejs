const crypto = require('crypto')
const randombytes = require('randombytes')

function getRandomString(n) {
    let sha1 = crypto.createHash('sha1')
    return sha1.update(randombytes(16)).digest('hex')
}



function toHex(str) {
    var buffer = Buffer.from(str, 'utf8')
    return buffer.toString('hex')
}
// console.log(crypto.getHashes())

function a() {
    let bytes = crypto.randomBytes(8)

    console.log(bytes)

    console.log(bytes.toString('hex'))
}

a()