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

        app.updateUserRoles(roles, user, userScore);
    })
    .catch(err => {console.error(err)});
}