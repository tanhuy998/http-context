const { ContextHandler } = require("isln/handler");
const Signal = require("../signalType/signal");
const CarrierSignal = require("../signalType/carrierSignal");

/**
 * BaseClass for HttpController and other HttpContext pipeline handler.
 * 
 * HttpContext pipeline Deals with signaling mechanism that manipulates the flow of control.
 * SignalIssuer throws signal(of any types), then SignalConsumer(s) catch and handle it.
 */
module.exports = class SignalIssuer extends ContextHandler {

    #issueTypes;

    constructor(_context, _signalTypes = []) {

        super(_context);

        this.#issueTypes = _signalTypes;

        this.#init();
    }

    #init() {


    }

    _emit(_any) {

        const signal = _any instanceof Signal ? _any : new CarrierSignal(this, _any);

        return this.#_emit(signal);
    }

    #_emit(_signal) {
        
        throw _signal;
    }
}