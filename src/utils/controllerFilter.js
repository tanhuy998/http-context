class RequestFilterError extends Error {

    #reason;

    get reason() {

        return this.#reason;
    }

    constructor(_func) {

        super('request filter not passed');

        this.#reason;
    }
}

/**
 * 
 * @param {object} param0 
 * @param {Array<Function>} _filters 
 * @returns 
 */
function applyFilter({request, response}, _filters = []) {

    if (!Array.isArray(_filters) || _filters.length === 0) {

        return;
    }

    for (const fn of _filters) {

        if (!fn(request, response)) {

            throw new RequestFilterError(fn);
        };
    }
}

module.exports = {applyFilter};