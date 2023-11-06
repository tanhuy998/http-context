const {registerRoute} = require('../utils/httpRoute.js');

const httpVerbs = [
    'get', 'post', 'put', 'delete', 'connect', 'options', 'trace', 'patch'
];

function mapRoute(_verb) {

    return function (_pattern) {

        return function routeDecorator(_func, context) {
    
            const {kind} = context;
    
            if (kind !== 'method') {
    
                throw new Error('Illegal usage Route mapping decoraotor');
            }
    
            registerRoute(_func, _verb, _pattern);

            return _func;
        }
    }
}

module.exports = new Proxy(httpVerbs, {
    get(target, verb) {

        if (!target.includes(verb)) {

            throw new Error(`ìnvalid http verb ${prop}`);
        }

        return mapRoute(verb);
    },
    set() {

        return false;
    }
})