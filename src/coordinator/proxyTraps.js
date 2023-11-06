const {sub_coordinator} = require('isln/coordinator');

/**
 * @typedef {import('isln/coordinator').Coordinator} Coordinator
 */

const traps = {
    /**
     * 
     * @param {Coordinator} target 
     * @param {string | Symbol} prop 
     * @returns 
     */
    get(target, prop) {

        return sub_coordinator(target, prop);
    },
    set() {

        return false;
    }
}

module.exports = traps;