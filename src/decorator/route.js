const {registerRoute} = require('../utils/httpRoute.js');
const { concatenateRoutePattern } = require('../utils/route/route.utils.js');
const { group, currentGroup } = require('./group.js');

const httpVerbs = [
    'get', 'post', 'put', 'delete', 'connect', 'options', 'trace', 'patch'
];

Object.seal(httpVerbs);

var routeList = new Set();

/**
 * concatenate _pattern with current group's prefixes and check for existence
 * 
 * @param {string} route 
 * @throws
 */
function checkRouteExist(_verb, _pattern) {

    const currGroup = currentGroup();

    for (const prefix of currGroup.prefixes) {

        const fullRoute = `${_verb} ${concatenateRoutePattern(prefix, _pattern)}`;
    
        if (routeList.has(fullRoute)) {
    
            throw new Error(`route "${fullRoute}" is duplicated`);
        }

        routeList.add(fullRoute);
    }
}

function mapRoute(_verb) {

    return function (_pattern) {

        checkRouteExist(_verb, _pattern);
        
        return function routeDecorator(_func, context) {
    
            const {kind, name} = context;
    
            if (kind !== 'method') {
    
                throw new Error('Illegal usage Route mapping decoraotor');
            }
    
            registerRoute(_func, _verb, _pattern, name);

            
            return _func;
        }
    }
}



module.exports = new Proxy(httpVerbs, {
    methods: {
        group: group
    },
    get(verbList, action) {
        
        if (action in this.methods) {
            
            return this.methods[action];
        }
        
        if (!verbList.includes(action)) {

            throw new Error(`ìnvalid http verb ${action}`);
        }

        return mapRoute(action);
    },
    set() {

        return false;
    }
})