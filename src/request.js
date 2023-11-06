const RequestCoordinator = require('./coordinator/requestCoordinator.js');
const traps = require("./coordinator/proxyTraps.js");

const Request = new Proxy(RequestCoordinator, traps);

module.exports = Request;