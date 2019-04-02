const open = require('open');

~(async () => {
    await open('https://www.baidu.com', {
        app: ['google chrome', '--kiosk']
    });
})()