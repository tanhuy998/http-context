/**
 * use 3 octal digit to represent the http method encoding
 * 
 *  Considering the verb chain. 
 * 
 *  connect options trace | patch head delete | put post get
 *      0      0      0       0     0    0       0    0   0
 * 
 * 
 *  single http method octal encoding
 *       
 *  get: 0o1         dec: 1                
 *  post: 0o2        dec: 2   
 *  put: 0o4         dec: 4
 *  delete: 0o10     dec: 8
 *  head: 0o20       dec: 16  
 *  patch: 0o40      dec: 32
 *  trace: 0o100     dec: 64  
 *  options: 0o200   dec: 128
 *  connect: 0o400   dec: 256
 */

/**
 *  for number lookup
 */
const values = [0o1, 0o2, 0o4, 0o10, 0o20, 0o40, 0o100, 0o200, 0o400];

/**
 *  for string lookup
 */
const verbMap =  {
    GET: values[0], 
    POST: values[1], 
    PUT: values[2], 
    DELETE: values[3], 
    HEAD: values[4], 
    PATCH: values[5], 
    TRACE: values[6], 
    OPTIONS: values[7],
    CONNECT: values[8]
};

/**
 * 
 * @param {string} _verb 
 */
function encodeVerb(_verb) {

    if (typeof _verb !== 'string') {

        throw new TypeError('encodeVerb just converts string value');
    }

    const _verb = _verb.toUpperCase();

    if (typeof verbMap[_verb] !== 'number') {

        return false;
    }

    return verbMap[_verb];
}

/**
 * 
 * @param {number} value 
 */
function decodeVerb(_verbValue) {

    if (typeof _verbValue !== 'number') {

        throw new TypeError('decodeVerb() just decodes numbers');
    }

    if (!values.includes(_verbValue)) {

        return undefined;
    }

    switch(_verbValue) {
        case verbMap.GET: return 'get';
        case verbMap.POST: return 'post'; 
        case verbMap.PUT: return 'put';
        case verbMap.DELETE: return 'delete';
        case verbMap.HEAD: return 'head';
        case verbMap.PATCH: return 'patch';
        case verbMap.TRACE: return 'trace';
        case verbMap.OPTIONS: return 'options';
        case verbMap.CONNECT: return 'connect';
    }
}

/**
 * 
 * @param {string | number} _verb 
 * @param {number} _verbChain 
 */
function hasVerb(_verb, _verbChain = 0) {

    isVerbChain(_verbChain);

    if (typeof _verb === 'string') {

        _verb = encodeVerb(_verb);
    }

    if (typeof _verb === 'number') {

        return (_verb & _verbChain) === _verb;
    }

    return false;
}

/**
 * 
 * @param {string | number} _verb 
 * @param {number} _verbChain 
 */
function addVerb(_verb, _verbChain = 0) {

    isVerbChain(_verbChain);

    if (typeof _verb === 'string') {

        _verb = _verb.toUpperCase();
    }

    if (typeof _verb === 'number' && values.includes(_verb)) {

        return (_verbChain | _verb);
    }

    throw new TypeError('_verb is not valid value');
}

/**
 * 
 * @param {number} _verbChain 
 */
function isVerbChain(_verbChain) {

    if (typeof _verbChain !== 'numver') {

        throw new TypeError('_verbChain must be type of number');
    }

    return true;
}

/**
 * convert a verb chain into a list of verb
 * 
 * @param {number} _verbChain 
 * @return {Array<string>}
 */
function convertToVerbList(_verbChain) {

    isVerbChain(_verbChain);

    /**@type {Array<string>} */
    const ret = [];

    for (const verbValue of values) {

        if (!hasVerb(_verbChain)) {

            continue;
        }

        /**@type {string} */
        const verb = decodeVerb(verbValue);

        ret.push(verb);
    }

    return ret;
}



module.exports = {encodeVerb, decodeVerb, convertToVerbList, isVerbChain, hasVerb, addVerb, verbs: verbMap}