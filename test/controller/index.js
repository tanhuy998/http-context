require('@babel/register')({
    only: [
        /controller/,
        /component/
    ]
})

const express = require('express');
const app = express();

const port = 3000;

const HttpContext = require('../../src/httpContext');
const Controller = require('./controller/controller');
const IGet = require('./interface/iGet');
const Something = require('./component/something');

//HttpContext.pipeline.addPhase().setHandler(Controller).build();

HttpContext.use(Controller);
HttpContext.components.bind(IGet, Something);

//app.use(Controller.serve());

app.use(HttpContext.serve());

app.listen(port, (error) => {

    if (error) {

        throw error;
    }

    console.log('app listen on port', port);
})