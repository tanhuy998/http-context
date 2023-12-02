const { ContextHandler } = require("isln/handler");

module.exports = class SignalIssuer extends ContextHandler {

    #issueTypes;

    constructor(_context, _signalTypes = []) {

        super(_context);

        this.#issueTypes = _signalTypes;

        this.#init();
    }

    #init() {


    }

    _emit(_signal) {


    }
}