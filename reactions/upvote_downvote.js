exports.updateUserData = function(app, guildID, collection, filter, update, user) {
    app.mongodb.update(
        app.mongoClient,
        guildID,
        'Users',
        filter,
        update
    )
    .then(data => {
        checkForRoleUpdate(app, guildID, data.value, user);
    })
    .catch(err => console.error(err));

    app.mongodb.update(
        app.mongoClient,
        guildID,
        collection,
        filter,
        update
    );
}

function checkForRoleUpdate(app, guildID, userData, user) {
    // Try to find a document in the config collection
    app.mongodb.read(
        app.mongoClient,
        guildID,
        'Config',
        { _id: 'Roles' }
    )
    .then(data => {
        var roles;
        const userScore = userData.score;

        // Check if guild has custom set roles, if not: use default from config
        // Then check if user has enough score, if no: return
        // Then try to find the role in the guild, if it doesn't exist: create it, and add user to the role
        // If the user is already in one of the roles: remove the user from it

        if (data.length) {
            roles = data[0];
            delete roles["_id"];         
        }
        else {
            roles = app.config.defaultRoles;
        }

        const roleObject = checkIfUserHasEnoughScore(userScore, roles);
        if (roleObject === undefined) return;
        checkIfUserHasRole(roles, roleObject, user);
        addUserToRole(roleObject, user);
    })
    .catch(err => {console.error(err)});

    function checkIfUserHasEnoughScore(userScore, roles) {
        for (var i = 0; i < Object.keys(roles).length; i++) {
            const role = roles['Rank' + i];
            if (userScore > role.score) return role;
            
        }
    }

    function checkIfUserHasRole(roles, roleObject, user) {
        for (const role of user.roles.cache) {
            if (role[1].name == '@everyone') continue;
            for (var i = 0; i < Object.keys(roles).length; i++) {
                const r = roles['Rank' + i];
                if (r.name == role[1].name && role[1].name != roleObject.name) {
                    user.roles.remove(role);
                }              
            }
        }
    }

    function addUserToRole(roleObject, user) {
        const role = user.guild.roles.cache.find(role => role.name === roleObject.name);
        if (role == undefined) {
            user.guild.roles.create({
                data: {
                    name: roleObject.name,
                    color: roleObject.color,
                },
                reason: roleObject.reason,
            })
            .then(role => {
                user.roles.add(role);
            })
            .catch(err => {console.error(err)});
        }
        else {
            user.roles.add(role);
        }
    }
}