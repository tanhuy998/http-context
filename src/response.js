const ResponseCoordinator = require('./coordinator/responseCoordinator.js');
const traps = require('./coordinator/proxyTraps.js');

const Response = new Proxy(ResponseCoordinator, traps);

module.exports = Response;



