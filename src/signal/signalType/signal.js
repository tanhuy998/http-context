/**
 * @typedef {import('../pipeline/signalIssuer.js')} SignalIssuer
 */

module.exports = class Signal {

    /**@type {Array<SignalIssuer>} */
    #trace = [];    

    /**@type {SignalIssuer} */
    get issuer() {

        const length = this.#trace.length;

        const last = length === 0 ? length : length - 1;

        return this.#trace[last];
    }

    /**@type {SignalIssuer} */
    get origin() {

        return this.#trace[0];
    }

    /**
     * 
     * @param {SignalIssuer} _issuer 
     */
    constructor(_issuer) {

        this.#trace.push(_issuer);
    }

    /**
     * 
     * @param {SignalIssuer} _issuer 
     */
    _overloadIssuer(_issuer) {

        this.#trace.push(_issuer)
    }   
}