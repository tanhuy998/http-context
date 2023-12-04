const Signal = require("./signal");

/**
 * @typedef {import('../pipeline/signalIssuer.js')} SignalIssuer
 */

/**
 * @template T
 */
module.exports = class CarrierSignal extends Signal {

    /**@type {T} */
    #data;   

    /**@type {T} */
    get data() {

        return this.#data
    }

    /**
     * 
     * @param {SignalIssuer} _issuer 
     * @param {T} _data 
     */
    constructor(_issuer, _data) {

        super(_issuer);

        this.#data = _data;
    }
}