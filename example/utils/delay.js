module.exports = {
    delay: (ms) => new Promise(r => setTimeout(() => r(2), ms)),
}