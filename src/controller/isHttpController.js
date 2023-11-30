const { BASE_HTTP_CONTROLLER } = require("./constant");
const self = require('reflectype/src/utils/self');
const HttpController = require("./httpController");
const { isChild_loosely } = require("../utils/comparison");

function isHttpController(_unknown) {

    return isChild_loosely(_unknown, HttpController) ||
            (typeof _unknown === 'function' ? 
            _unknown.base === BASE_HTTP_CONTROLLER : 
            self(_unknown)?.base === BASE_HTTP_CONTROLLER);
}

module.exports = isHttpController;