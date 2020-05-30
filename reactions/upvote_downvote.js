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
    // I will work out the filter once i decide how documents un the config collection will be sorted
    app.mongodb.read(
        app.mongoClient,
        guildID,
        'Config',
        {}
    )
    .then(data => {
        const userScore = userData.score;

        // Check if guild has custom set roles, if not: use default from config
        // Then check if user has enough score, if no: return
        // Then try to find the role in the guild, if it doesn't exist: create it, and add user to the role
        // If the user is already in one of the roles: remove the user from it

        if (data.length) {
            // I will work out this section once I have implemented adding custom roles
        }
        else {
            const roleObject = checkIfUserHasEnoughScore(userScore, app.config.defaultRoles);
            if (roleObject === undefined) return;
            checkIfUserHasRole(app.config.defaultRoles, roleObject, user);
            addUserToRole(roleObject, user);
        }
    })
    .catch(err => {console.error(err)});

    function checkIfUserHasEnoughScore(userScore, roles) {
        for (const role of roles) {
            if (userScore > role.score) return role;
            else if (role == roles[roles.length - 1]) continue;
        }
    }

    function checkIfUserHasRole(roles, roleObject, user) {
        for (const role of user.roles.cache) {
            if (role[1].name == '@everyone') continue;
            // if (roles.includes(role[1].name) && role[1].name != roleObject.name) {
            //     user.roles.remove(role);
            // }
            for (var r of roles) {
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