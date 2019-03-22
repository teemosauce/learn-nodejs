const Koa = require('koa')
const fs = require('fs')

const static = require('koa-static')
const bigpipe = require('koa-bigpipe')
const path = require('path')

const views = require('./view-render')

const app = new Koa({
    multipart: true
})

// 选择的view渲染引擎
app.use(views(__dirname + '/pagelets', {
    map: {
        hbs: 'handlebars'
    }
}))

// 响应时间中间件
app.use(async (ctx, next) => {
    const start = Date.now()
    if (!ctx.cookies.get("sign")) {
        ctx
            .cookies
            .set("sign", sign(), {
                maxAge: 604800000
            })
    }

    await next()
    const ms = Date.now() - start
    ctx.set('X-Response-Time', `${ms}ms`)
})

app.use(static(__dirname))

app.use((ctx, next) => {
    console.log("包装bigpipe中间件")
    return bigpipe(ctx, next)
})

var _ctx;
app.use(async ctx => {

    console.log("最后一层处理")
    var content = await readFileContent('layout.html')

    // ctx.body = content

    if (!_ctx) {
        _ctx = ctx;
        console.log("初始化ctx")
    }

    if (_ctx !== ctx) {
        console.log("新来一个ctx")
        _ctx = ctx
    }
    ctx.write(content)

    // ctx.state.title = "我是pagelet1"


    //1.await串行加载 
    // console.log("render片段1")
    // var str1 = await ctx.render('./pagelet1/pagelet1.hbs')
    // console.log("render片段1结束并返回给客户端")
    // var html1 = addToBigpipe('pagelet1', str1)
    // ctx.write(html1)
   
    // console.log("render片段2")
    // var str2 = await ctx.render('./pagelet2/pagelet2.hbs')
    // console.log("render片段2结束并返回给客户端")
    // var html2 = addToBigpipe('pagelet2', str2)
    // ctx.write(html2)
    // ctx.write('<script src="pagelets/pagelet2/pagelet2.js"></script>')

    // ctx.end()

//     //2. Promise的串行加载 有bug 不知道什么问题
//     console.log("render片段1")
//     var str2 = await ctx.render('./pagelet1/pagelet1.hbs').then(function(str1){
//         var html1 = addToBigpipe('pagelet1', str1);
//         ctx.write(html1)
//         console.log("render片段1结束并返回给客户端")
//         console.log("render片段2")
//         return ctx.render('./pagelet2/pagelet2.hbs')
//     })

//    // 改用下面的方法可以
//     var html2 = addToBigpipe('pagelet2', str2)
//     ctx.write(html2)
//     ctx.write('<script src="pagelets/pagelet2/pagelet2.js"></script>')

//     // 关闭连接
//     ctx.end()

    //3. 修改成并行处理 谁先render完就先返回
    console.log("render片段1")
    var promise1 = waitQueryData(1000, {
        title: '数据库数据'
    }).then(function(data){
        ctx.state.title = data.title
        return ctx.render('./pagelet1/pagelet1.hbs')
    }).then(function (html) {
        console.log("render片段1结束并返回给客户端")
        html = addToBigpipe('pagelet1', html)
        ctx.write(html)
        return Promise.resolve(true)
    }, () => {
        console.log("返回pagelet1发生错误")
        return Promise.reject(false)
    })
    console.log("render片段2")
    var promise2 = ctx.render('./pagelet2/pagelet2.hbs').then(function (html) {
            console.log("render片段2结束并返回给客户端")
            html = addToBigpipe('pagelet2', html)
            ctx.write(html)
            ctx.write('<script src="pagelets/pagelet2/pagelet2.js"></script>')
            return Promise.resolve(true)
        }, () => {
            console.log("返回pagelet2发生错误")
            return Promise.reject(false)
        })
    
    // 用await的方式才没有bug 用then的方式会提示在写之前已经关闭了ctx
    await Promise.all([promise1, promise2])
    console.log("请求结束 关闭连接")
    ctx.end()
})

app.on('error', err => {
    console.log('error message', err)
})
app.listen(3000)

function sign() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ?
            r :
            (r & 0x3 | 0x8);
        return v.toString(16)
    });
}

function addToBigpipe(key, html) {
    var start = '<script>'
    var content = 'bigpipe.set("' + key + '",`' + html + '`)'
    var end = '</script>'

    return start + content + end
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

/**
 * 模仿一个异步查询数据的方法
 */
function waitQueryData(ms, data){
    return new Promise(function(resolve){
        setTimeout(function(){
            resolve(data)
        }, ms || 2000)
    })
}