const HttpController = require('../../../src/controller/httpController.js');
const Route = require('../../../src/decorator/route.js');

module.exports = class Controller extends HttpController{

    @Route.get('/')
    index() {

        const res = this.httpContext.response;
        const req = this.httpContext.request;

        console.log('test controller', req, res);

        res.send('done');
    }
}