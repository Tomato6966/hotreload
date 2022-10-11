const crypto = require("crypto");

const getUUID = () => "Documatic | ID: " + crypto.randomBytes(16).toString("hex");

module.exports = { getUUID }