const { OutgoingMessage } = require("node:http");
const ResponseBodyComponent = require("./component/responseBodyComponent");
const ResponseHeaderComponent = require("./component/responseHeaderConponent");
const { Duplex } = require("node:stream");

/**
 * @typedef {import('express')} express
 */

module.exports = class Responseresult {

    /**@type {express.OutgoingMessage} */
    #responseObj;
    
    /**@type {ResponseHeaderComponent} */
    #header;

    /**@type {ResponseBodyComponent} */
    #body; 
    /**@type {} */
    #cookie;

    #status;

    get hasSocket() {

        return this.#responseObj?.socket instanceof Duplex;
    }

    constructor(status, headers, body, cookie) {

        this.#header = headers;
        this.#cookie = cookie;
        this.#body = body;
        this.#status = status;
    }

    /**
     * 
     * @param {OutgoingMessage} _response 
     */
    setSocket(_response) {

        this.#responseObj = _response;
    }

    send() {

        if (!this.hasSocket) {

            throw new Error('no socket connection to send response');
        }

        this.#sendStatus();
        this.#sendHeaders();
        this.#sendCookie();
        this.#sendBody();
    }

    #sendStatus() {

        this.#responseObj.statusCode(this.#status);
    }

    #sendHeaders() {

        this.#responseObj.header(this.#header.value);
    }

    #sendCookie() {

        //this.#responseObj.
    }

    #sendBody() {

        this.#responseObj.send(this.#body.value);
    }
}