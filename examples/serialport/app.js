const express = require('express')
const app = express()
const http = require('http')
const socketIO = require('socket.io')
const SerialPort = require('serialport')
const clients = {}

app.use(express.static(__dirname + '/public'))
let server = http.Server(app)
server.listen(8080, () => {
    console.log('http server 开启')
})

let io = socketIO(server)
io.on('connection', client => {
    clients[client.id] = client
    client.on('disconnect', () => {
        delete clients[client.id]
    })

    client.on('reset', () => {
        resetDrawData()
    })
})

// SerialPort.list((err, ports) => {
//     console.log(ports)
// })

let serialPort = new SerialPort('COM2', {
    baudRate: 9600,
    dataBits: 8,
    parity: 'none',
    stopBits: 1
})

let drawData, clock

function resetDrawData() {
    drawData = [
        [0, Date.now()]
    ]

    if(clock){
        clearInterval(clock)
    }
}
resetDrawData()

serialPort.on('data', data => {
    let flag = Buffer.from(data).toString('utf8')

    if (clock) {
        clearInterval(clock)
    }
    clock = setInterval(() => {
        switch (flag) {
            case '01':
                drawData.push([storageVoltage(true, drawData[drawData.length - 1][0]), Date.now()])
                break
            case '00':
                drawData.push([storageVoltage(false, drawData[drawData.length - 1][0]), Date.now()])
                break
            default:
                break
        }

        for (let id in clients) {
            clients[id].emit('data', drawData)
        }
    }, 200)
})

function storageVoltage(flag, lastVoltage) {
    let voltageUp = 0.05,
        maxVoltage = 5,
        minVoltage = 0

    if (flag) {
        lastVoltage = lastVoltage + voltageUp

        if (lastVoltage > maxVoltage) {
            lastVoltage = maxVoltage
        }
    } else {
        lastVoltage = lastVoltage - voltageUp
        if (lastVoltage < minVoltage) {
            lastVoltage = minVoltage
        }
    }

    return lastVoltage
}