module.exports = {
    m() {
        console.log.apply(console, arguments);
        console.log('----------------------------------------------');
    }
}