const { delay } = require("../utils/delay");
const { getUUID } = require("../utils/uuId");
const JsonData = require("../data.json");
// start script
module.exports = async () => {
    console.log(JsonData)
    for(let i = 0; i < 5; i++) {
        console.log(getUUID());
        await delay(100)
    }
    console.log("\n\n\n")
    /* // setInterval need to be stopped before u restart them...
     setInterval(() => {
        console.log(getUUID());
     }, 1000)
    */
}