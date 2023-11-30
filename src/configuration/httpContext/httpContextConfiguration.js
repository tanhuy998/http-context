module.exports = class HttpContextConfiguration {

    /**@type {Set<typeof HttpController>} */
    #controllers;

    #controllerIds;

    #errorHandlers;

    #authScheme;

    get hasAuth() {

        return typeof this.#authScheme === 'function';
    }

    get controllers() {

        return this.#controllers;
    }

    get errorHandlers() {

        return this.#errorHandlers;
    }

    get authScheme() {

        return this.#authScheme;
    }

    constructor({controllers, controlerIds, errorHandlers}) {

        this.#controllers = controllers;
        this.#controllerIds = controlerIds;
        this.#errorHandlers = errorHandlers;
    }

    /**
     * 
     * @param {typeof HttpController | HttpController} _unknown 
     */
    hasController(_unknown) {

        let id;

        if (typeof _unknown === 'symbol') {

            id = _unknown;
        }
        else if (_unknown instanceof HttpController) {

            id = self(_unknown).id;
        }
        else if (_unknown.prototype instanceof HttpController) {

            id = _unknown.id;
        }
        else {

            throw new TypeError('_unknown has to be a Controller instance or a Controller class');
        }
        
        return this.#controllerIds.has(controllerId);
    }
}