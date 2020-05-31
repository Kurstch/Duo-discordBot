module.exports.navigation = (app, ws) => {
    ws.express.get('/nav', (req, res) => {
        if (req.query.id == "roles") {
            app.mongodb.read(
                app.mongoClient,
                '706884271763095584',
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
                res.render('roles', { title: "DUO-Roles", roles: roles})
            })
            .catch(err => { console.log(err); })
        }
        else {
            res.render(req.query.id, { title: "DUO bot" })
        }
    });
}