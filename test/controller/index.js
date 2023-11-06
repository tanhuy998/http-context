const HttpController = require('../../src/controller/httpController.js');
const Route = require('../../src/decorator/route.js');

const express = require('express');
const app = express();

const port = 3000;

class Controller extends HttpController{

    @Route.get('/')
    index() {

        const res = this.httpContext.response;
        const req = this.httpContext.request;

        console.log('test controller', req, res);

        res.send('done');
    }
}

app.use(Controller.serve());

app.listen(port, (error) => {

    if (error) {

        throw error;
    }

    console.log('app listen on port', port);
})