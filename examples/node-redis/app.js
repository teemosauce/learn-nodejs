var redis = require('redis')
var log = require('../log')


var client = redis.createClient({
    host: '192.168.1.190',
    port: '39767'
})

client.on("error", (err) => {
    log.m("Error " + err);
});

client.on('connect', () => {
    log.m("连接成功");

    client.get("register:13812664563", function (err, reply) {
        console.log(reply.toString()); // Will print `OK`
    });
})

