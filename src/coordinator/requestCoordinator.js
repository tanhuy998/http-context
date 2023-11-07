const { SessionCoordinator } = require("isln/coordinator");

module.exports = class RequestCoordinator extends SessionCoordinator {

    //static key = Symbol(Date.now());

    static {

        this._init();
    }
}
