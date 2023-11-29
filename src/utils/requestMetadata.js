const {METADATA} = require('reflectype/src/constants.js');
const self = require('reflectype/src/utils/self.js');
const { checkController, resolveControllerId } = require('./controller');
const metadata = require('isln/src/utils/metadata');

module.exports = {
    pointController, 
    initRequestMetadata, 
    getRequestMetadata, 
    getControllerMetadata, 
    addMetaForController, 
    hasControllerMetadata, 
    hasMetadata, 
    initControllerMetadata,
    getPointControllerId
};

function checkRequest(req) {

    if (typeof req !== 'object') {

        throw new TypeError('req is not defined');
    }
}

function initRequestMetadata(req) {

    checkRequest(req);
    
    return req[METADATA] ??= {};
}

function initControllerMetadata(req, _controller) {

    const wrapper = initRequestMetadata(req);

    const id = resolveControllerId(_controller);
    
    const controllerMeta =  wrapper[id] ??= {};

    return controllerMeta;
}

function pointController(req, _controller) {

    const wrapper = initRequestMetadata(req);

    const id = resolveControllerId(_controller);
    
    wrapper.pointedControllerId = id;
}

function getPointControllerId(req, _controller) {

    const wrapper = metadata(req);

    return wrapper?.pointedControllerId;
}

function getRequestMetadata(req) {

    checkRequest(req);

    return req[METADATA];
}

function getControllerMetadata(req, _controller) {

    checkController(_controller);

    const controllerId = resolveControllerId(_controller);

    const metadata = getRequestMetadata(req);

    if (typeof metadata !== 'object') {

        return undefined;
    }

    return metadata[controllerId];
}

function addMetaForController(req, _controller, _meta) {

    if (typeof _meta !== 'object') {

        return false;
    }

    const controllerMetadata = req[METADATA] ??= {};

    Object.assign(controllerMetadata, _meta);

    return true;
}

function hasMetadata(req) {

    return typeof getRequestMetadata(req) === 'object';
}
 
function hasControllerMetadata(req, _controller, options = {}) {

    try {

        checkController(_controller);

        if (!hasMetadata(req)) {

            return false;
        }

        const meta = getControllerMetadata(req, _controller);

        if (typeof meta !== 'object') {

            return false;
        }

        if (match(meta, options)) {

            return true;
        }
        else {

            return false;
        }
    }
    catch {

        return false;
    }
}

function match(target = {}, toCompared = {}) {

    for (const prop in toCompared) {

        if (target[prop] !== toCompared[prop]) {

            return false;
        }
    }

    return true;
}

