const { ContextHandler } = require("isln/handler");

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

    _emit(_signal) {

        return this.#_emit(_signal);
    }

    #_emit(_signal) {
        
        throw _signal;
    }
}