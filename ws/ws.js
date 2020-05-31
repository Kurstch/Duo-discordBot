const express = require('express');
const hbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');

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

        this.registerRoots(app);

        this.server = this.express.listen(app.config.ws.port, () => {
            console.log(`listening on port ${this.server.address().port}`)
        });
    }

    registerRoots(app) {
        this.express.get('/', (req, res) => {
            res.render('index', { title: "DUO bot" })
        });

        const nav = require('./public/nav');
        nav.navigation(app, this);

        const roles = require('./public/roles');
        roles.roles(app, this);
    }
}

module.exports = WebSocket;