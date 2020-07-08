module.exports.routing = (app, ws) => {
    ws.express.get('/', (req, res) => {
        res.render('home', {title: 'Duo Home'});
    });

    ws.express.get('/index', (req, res) => {
        res.render('index', {title: "index"})
    })

    ws.express.get('/home', (req, res) => {
        res.render('home', {title: 'Duo Home'});
    });

    ws.express.get('/roles/:gid?', (req, res) => {
        // Check if proper guild id was given
        // Check if bot is connected to the guild
        if (isNaN(req.params.gid)) return;
        if (app.discordClient.guilds.cache.find(g => g.id == req.params.gid) === undefined) {
            return res.render('duoConnectionError', {title: 'Duo not connected'});
        }


        // Get custom roles from mongodb (if they exist) to render in the view
        app.mongodb.read(
            app.mongoClient,
            req.params.gid,
            'Config',
            { _id: 'Roles' }
        )
        .then(data => {
            /*
                Check if custom roles (data) was found
                Asign displayColor for role colorDisplay div
            */

            var roles;
            if (data.length) {
                roles = data[0];
                delete roles["_id"];

                for (i = 0; i < Object.keys(roles).length; i++) {
                    const role = roles['Rank' + i];
                    if (Array.isArray(role.color)) {
                        role.color[1] = ' ' + role.color[1];
                        role.color[2] = ' ' + role.color[2];
                        role.displayColor = `rgb(${role.color})`;
                    }
                    else role.displayColor = role.color; 
                }
            }
            else {
                roles = app.config.defaultRoles;
                for (i = 0; i < Object.keys(roles).length; i++) {
                    const role = roles['Rank' + i];
                    role.displayColor = role.color;
                }
            }
            res.render('roles', { title: `DUO ${req.path.split('/')[1]}`, roles: roles})
        })
        .catch(err => { console.log(err); })
    });

    ws.express.get('/unauth', (req, res) => {
        res.render('unauth', {title: "unauth"});
    });

    ws.express.get('/noGuilds', (req, res) => {
        res.render('noGuilds', {title: "no guilds found"})
    });
}