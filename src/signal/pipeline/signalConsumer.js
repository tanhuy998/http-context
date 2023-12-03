const { ErrorHandler } = require("isln/handler");
const Signal = require("../signalType/signal");

module.exports = class SignalConsumer extends ErrorHandler {

    /**
     * @override
     */
    acceptOrigin = [Signal];

    #signal;

    get signal() {

        return this.#signal;
    }

    constructor(_breakPoint) {

        super(_breakPoint);

        this.#init();
    }

    #init() {

        this.#signal = this.originError;
    }

    pass() {

        this.dismiss();
    }
}