const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

class WebSocket {
    constructor(app) {
        this.express = express();
        
        this.express.engine('hbs', hbs({
            extname: 'hbs',
            defaultLayout: 'layout',
            layoutsDir: __dirname + '/layouts'
        }));

        this.express.set('views', path.join(__dirname, 'views'));
        this.express.set('view engine', 'hbs');
        this.express.use(express.static(path.join(__dirname, 'public')));
        this.express.use(bodyParser.urlencoded({extended: false}));
        this.express.use(bodyParser.json());

        require('./routing').routing(app, this);
        require('./postRequests').postRequests(app, this, fetch);

        this.server = this.express.listen(process.env.PORT, () => {
            console.log(`listening on port ${this.server.address().port}`)
        });
    }
}

module.exports = WebSocket;