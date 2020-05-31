module.exports.roles = (app, ws) => {
    ws.express.post('/updateRoles', (req, res) => {
        const rolesArray = [];
        for (const index in req.body.name) {
            rolesArray.push({
                name: req.body.name[index],
                score: req.body.score[index],
                color: req.body.color[index],
                reason: req.body.reason[index]
            });          
        }
        rolesArray.sort((a, b) => {
            return a.score - b.score;
        });
        rolesArray.reverse();

        const roles = {};
        for (const index in rolesArray) {
            roles['Rank' + index] = rolesArray[index];
        }
        app.mongodb.replace(
            app.mongoClient,
            '706884271763095584',
            'Config',
            { _id: 'Roles' },
            roles
        );
        res.redirect('back');
    });
}