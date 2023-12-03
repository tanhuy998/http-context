const ResponseBodyComponent = require("./component/responseBodyComponent");
const ResponseHeaderComponent = require('./component/responseHeaderConponent');
const Responseresult = require("./responseResult");
const self = require('reflectype/src/utils/self');

module.exports = class ResponseResultBuilder {

    /**@type {ResponseHeaderComponent} */
    #header;

    /**@type {ResponseBodyComponent} */
    #body;

    #status;

    #cookie;

    constructor(statuc) {


    }

    build() {

        return new Responseresult();
    }

    /**
    * 
    * @param {Object} _headers 
    */
    header(_headers) {

        //this.#header = this.#header?.merge(_headers) ?? new ResponseHeaderComponent(_headers);

        this.#commitComponents(this.#header, _headers);

        return this;
    }

    body(_content) {

        //this.#header = this.#header?.append(_content) ?? new ResponseHeaderComponent(_content);
        this.#commitComponents(this.#body, _content);

        return this;
    }

    cookie(_content) {

        this.#commitComponents(this.#cookie, _content);

        return this;
    }

    contentType(_type) {

        this.#header.overWrite(_type);
    }

    #commitComponents(_component, _content) {

        const componentType = self(_component);

        switch(componentType) {
            case ResponseHeaderComponent:
                return 
            case ResponseBodyComponent:
                return 
            default:
                throw new TypeError('invalid response result commitment');
        }
    }
}