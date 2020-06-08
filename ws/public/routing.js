module.exports.routing = (app, ws) => {
    ws.express.get('/', (req, res) => {
        res.render('callback', { title: "DUO bot" })
    });

    ws.express.get('/home', (req, res) => {
        res.render('home', {title: 'Duo Home'});
    });

    ws.express.get('/roles/:gid?', (req, res) => {
        if (isNaN(req.params.gid)) return;
        if (app.discordClient.guilds.cache.find(g => g.id == req.params.gid) === undefined) return res.render('duoConnectionError', {title: 'Duo not connected'});
        app.mongodb.read(
            app.mongoClient,
            req.params.gid,
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
    });

    ws.express.get('/unauth', (req, res) => {
        res.render('error', {title: 'unauth'});
    });
}