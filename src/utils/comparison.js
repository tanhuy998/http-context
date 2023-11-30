const self = require('reflectype/src/utils/self');

function isChild_loosely(_unknown, base) {

    return _unknown instanceof base ||
            self(_unknown)?.prototype instanceof base; 
}

module.exports = {
    isChild_loosely,
}