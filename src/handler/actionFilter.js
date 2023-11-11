const { ContextHandler } = require("isln/handler");

function actionFilters() {

    return class PreActionFilter extends ContextHandler {

        constructor() {
    
            super(...arguments);
        }
    
        handle() {
    
            
        }
    }
}

module.exports = actionFilters;