const {encodeVerb, decodeVerb, convertToVerbList, isVerbChain, hasVerb, addVerb, verbs: verbMap} = require('../../src/utils/httpMethodEncoding.js');

/**
 * the verb chain indicate that it contains two verbs included GET and PUT
 */
/**@type {number} */
const verbChain = 0o5

console.log(hasVerb('options', verbChain));

const newChain = addVerb('options', verbChain);

console.log(hasVerb('post', newChain));

console.log(convertToVerbList(newChain));

