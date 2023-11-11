const {implement} = require('reflectype/src/decorators');
const IGet = require('../interface/iGet');

@implement(IGet)
class Something {

    static id = 0;

    #id = ++this.constructor.id;

    get() {

        return this.#id;
    }
}

module.exports = Something;