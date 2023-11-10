const self = require('reflectype/src/utils/self');

function resolveControllerId(_controller) {

    return typeof _controller !== 'function' ? _controller.id : self(_controller)?.id;
}

function checkController(_controller) {

    if (!isController(_controller)) {

        throw new TypeError('_controller is not type of [HttpController]');
    }
}

function isController(_controller) {

    return typeof resolveControllerId(_controller) === 'symbol';
}

module.exports = {resolveControllerId, checkController, isController};