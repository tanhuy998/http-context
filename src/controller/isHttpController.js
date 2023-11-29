const { BASE_HTTP_CONTROLLER } = require("./constant");
const self = require('reflectype/src/utils/self');

function isHttpController(_unknown) {

    return (typeof _unknown === 'function' ? 
            _unknown.base === BASE_HTTP_CONTROLLER : 
            self(_unknown)?.base === BASE_HTTP_CONTROLLER);
}

module.exports = isHttpController;