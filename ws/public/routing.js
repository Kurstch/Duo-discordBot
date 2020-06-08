module.exports.routing = (app, ws) => {
    ws.express.get('/', (req, res) => {
        res.render('callback', { title: "DUO bot" })
    });

    ws.express.get('/roles', (req, res) => {
        if (!checkIfBotHasGuild()) return;
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
    
    ws.express.get('/home', (req, res) => {
        res.render('home', {title: 'Duo Home'});
    });
}