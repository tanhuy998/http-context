const { SessionCoordinator } = require("isln/coordinator");

module.exports = class ResponseCoordinator extends SessionCoordinator {

    //static key = Symbol(Date.now());

    static {

        this._init();
    }
}
