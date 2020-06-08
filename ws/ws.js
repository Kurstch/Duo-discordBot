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

        this.registerRoots(app);

        this.server = this.express.listen(app.config.ws.port, () => {
            console.log(`listening on port ${this.server.address().port}`)
        });
    }

    registerRoots(app) {
        this.express.get('/', (req, res) => {
            res.render('callback', { title: "DUO bot" })
        });

        this.express.get('/nav', (req, res) => {
            if (req.query.id == 'home') {
                res.render('home', {title: 'DUO Home'});
            }
            else if (req.query.id == 'roles') {
                if (!checkIfBotHasGuild()) return 
                app.mongodb.read(
                    app.mongoClient,
                    req.query.gid,
                    'Config',
                    { _id: 'Roles' }
                )
                .then(data => {
                    var roles;
                    if (data.length) {
                        roles = data[0];
                        delete roles["_id"];
                    }
                    else {
                        roles = app.config.defaultRoles;
                    }
                    res.render('roles', { title: `DUO ${req.query.id}`, roles: roles})
                })
                .catch(err => { console.log(err); })
            }

            function checkIfBotHasGuild() {
                if (req.query.token == "undefined") {
                    res.render('error', {error: 'You haven\'t logged in'});
                    return false;
                }
                var guild = app.discordClient.guilds.cache.find(g => g.id == req.query.gid);
                if (guild == undefined) {
                    res.render('duoConnectionError');
                    return false;
                }
                return true;
            }
        });

        this.express.post('/updateRoles', (req, res) => {
            //check if token is provided
            if (!req.body.token) return res.json({error: "unauth"});
            fetch("https://discordapp.com/api/users/@me/guilds", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + req.body.token
                }
            })
            .then(x => x.json())
            .then(response => {

                //check if user has admin permission
                var guild = response.find(x => x.id == req.body.guildID);
                if (!guild || !guild.owner) return res.json({error: "unauth"});

                //remove roles from guilds
                guild = app.discordClient.guilds.cache.find(g => g.id == req.body.guildID);
                for (var i in req.body.removedRoles) {
                    var role = guild.roles.cache.find(r => r.name == req.body.removedRoles[i]);
                    role.delete();
                }

                //update roles in database
                app.mongodb.replace(
                    app.mongoClient,
                    req.body.guildID,
                    'Config',
                    { _id: 'Roles' },
                    req.body.roles
                );

                //update guild user roles
                app.mongodb.read(
                    app.mongoClient,
                    req.body.guildID,
                    'Users',
                    {}
                )
                .then(data => {
                    guild.members.cache.each(member => {
                        if (member.user.bot) return;

                        var userScore;
                        try {var userScore = data.find(e => e._id == member.id).score;}
                        catch {return;}
                        if (userScore == undefined) return;

                        var role = app.updateUserRoles(req.body.roles, member, userScore);

                        // if guild doesn't have one of the auto-roles,
                        // wait until it is created
                        while (role === undefined) {}
                    });
                })
                .catch(err => console.error(err));

                res.redirect('back');
            })
            .catch(err => console.error(err));
        });   
    }
}

module.exports = WebSocket;