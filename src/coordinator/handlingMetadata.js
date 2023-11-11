const { SessionCoordinator } = require("isln/coordinator");

module.exports = class HandlingMetadata extends SessionCoordinator {

    static {

        this._init();
    }
}