const HttpController = require('../../../src/controller/httpController.js');
const Route = require('../../../src/decorator/route.js');
const {paramsType} = require('reflectype/src/decorators');
const Something = require('../component/something.js');
const IGet = require('../interface/iGet.js');
const autowired = require('isln/decorator/autowired.js');

@Route.group('/admin/:user')
class Controller extends HttpController{

    @autowired
    @Route.get('/index/:option')
    @paramsType(IGet)
    index(_comp) {

        const res = this.httpContext.response;
        const req = this.httpContext.request;

        console.log('test controller', _comp.get());

        res.send('done');
    }

    @Route.get('/')
    default() {

        console.log('default route')

        const res = this.context.response;

        res.send('done default')
    }
}

module.exports = Controller;