const { ErrorHandler } = require("isln/handler");

module.exports = class SignalConsumer extends ErrorHandler {

    constructor(_breakPoint) {

        super(_breakPoint);

        this.#init();
    }

    #init() {


    }
}