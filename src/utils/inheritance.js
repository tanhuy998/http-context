const BASE = Symbol('base');

/**
 * 
 * @param {Object} _proto 
 * @param {string} _label 
 */
function defineBaseField(_proto, _label) {

    if (typeof _label !== 'string') {

        throw new TypeError('_label argument of defineBaseField() function must be typeof string');
    }

    Object.defineProperty(_proto, BASE, {
        configurable: false,
        writable: false,
        enumerable: true,
        value: Symbol(_label || _proto?.name || Date.now())
    });
}

function getBaseField(_proto) {

    return _proto[BASE];
}



module.exports = {
    defineBaseField,
    getBaseField,
}