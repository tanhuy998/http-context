const HttpController = require('../../../src/controller/httpController.js');
const Route = require('../../../src/decorator/route.js');
const {paramsType} = require('reflectype/src/decorators');
const Something = require('../component/something.js');
const IGet = require('../interface/iGet.js');
const autowired = require('isln/decorator/autowired.js');

@Route.group('/admin/:user')
class Controller2 extends HttpController{



    @autowired
    @Route.get('/controller2')
    @paramsType(IGet)
    index(_comp) {

        const res = this.httpContext.response;
        const req = this.httpContext.request;

        console.log('controller 2', _comp.get());
        console.log()
        res.send('done');
    }

    
}

module.exports = Controller2;