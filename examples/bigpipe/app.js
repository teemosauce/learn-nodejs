const Koa = require('koa')
const fs = require('fs')

const app = new Koa()

const views = require('./view-render')

app.use(views(__dirname + '/pagelets'), {
    map: {
        hbs: 'handlebars',
        extension: ''
    }
})

// 响应时间中间件
app.use(async (ctx, next) => {
    const start = Date.now()
    if (!ctx.cookies.get("sign")) {
        ctx.cookies.set("sign", sign(), {
            maxAge: 604800000
        })
    }

    await next()
    const ms = Date.now() - start
    ctx.set('X-Response-Time', `${ms}ms`)
})

app.use(require('koa-bigpipe'))

app.use(async ctx => {
    // var content = await readFileContent('layout.html')

    // ctx.write(content)

    // ctx.write(await readFileContent('pagelet1.html'))

    // ctx.write(await readFileContent('pagelet2.html'))

    // ctx.end()

    ctx.state = {
        title: "我是pagelet1"
    }

    var html = await ctx.render('./pagelet1/pagelet1.hbs')

    console.log(html)
})

app.on('error', err => {
    console.log('error message', err)
})
app.listen(3000)

function sign() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16)
    });
}

function readFileContent(filename) {
    return new Promise(function (resolve, reject) {
        var reader = fs.createReadStream(__dirname + '/pagelets/' + filename, 'utf-8');

        var content = ''
        reader.on('data', data => {
            content += data
        })

        reader.on('end', () => {
            resolve(content)
        })

        reader.on('error', err => {
            reject(err)
        })
    })
}