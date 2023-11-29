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
const Controller2 = require('./controller/controller2.js');
const IGet = require('./interface/iGet');
const Something = require('./component/something');

const http = require('node:http');

//HttpContext.pipeline.addPhase().setHandler(Controller).build();

HttpContext.use(Controller, Controller2);
HttpContext.components.bind(IGet, Something);

//app.use(Controller.serve());

app.use(HttpContext.serve());

http.createServer(app)
    .on('listening', cmd_cls)
    .on('listening', commandLineTitle)
    .listen(port);

function commandLineTitle() {

    console.log('server listen on port', port);
}

function cmd_cls() {

    const stdin = process.stdin;

    stdin.on('data', function(chunk) {

        const cmd = chunk.toString();
        
        if (cmd.match(/^clear\n*/g)) {
            
            console.clear();
            commandLineTitle();
        }
    });
}