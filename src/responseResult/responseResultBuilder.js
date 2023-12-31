const ResponseBodyComponent = require("./component/responseBodyComponent");
const ResponseCookieComponent = require("./component/responseCookieComponent");
const ResponseHeaderComponent = require('./component/responseHeaderConponent');
const bodyCommitment = require("./responseBuilderCommit/bodyCommitment");
const CookieCommitment = require("./responseBuilderCommit/cookieCommitment");
const HeaderCommitment = require("./responseBuilderCommit/headerCommitment");
const Responseresult = require("./responseResult");
const self = require('reflectype/src/utils/self');
const {implement} = require('reflectype/src/decorators');
const IActionResult = require("../actionResult/iActionResult");

const proto = module.exports = class ResponseResultBuilder {

    /**@type {ResponseHeaderComponent} */
    #header;

    /**@type {ResponseBodyComponent} */
    #body;

    /**@type {number} */
    #status = 200;

    /**@tpye {} */
    #cookie;

    constructor(statuc) {


    }

    build() {

        return new Responseresult(this.#status, this.#header, this.#body, this.#cookie);
    }

    resolveResult() {

        return this.build();
    }

    status(_value) {

        this.#status = _value;
    }

    /**
    * 
    * @param {Object} _headers 
    */
    header(_headers) {

        this.#header ??= new ResponseHeaderComponent();

        this.#commitComponents(this.#header, _headers);

        return this;
    }

    body(_content) {

        this.#body ??= new ResponseBodyComponent();

        this.#commitComponents(this.#body, _content);

        return this;
    }

    cookie(_content) {

        this.#cookie ??= new ResponseCookieComponent();

        this.#commitComponents(this.#cookie, _content);

        return this;
    }

    contentType(_type, ...params) {

        this.#header.overWrite(_type, params);
    }

    #commitComponents(_component, _content) {

        const componentType = self(_component);

        let strategy;

        switch(componentType) {
            case ResponseHeaderComponent:
                strategy = new HeaderCommitment(_component, _content);
                break;
            case ResponseBodyComponent:
                strategy = new bodyCommitment(_component, _content);
                break;
            case ResponseCookieComponent:
                strategy = new CookieCommitment(_component, _content);
                break;
            default:
                throw new TypeError('invalid response result commitment');
        }

        strategy.commit();
    }
}

implement(IActionResult)(proto, {kind: 'class'});