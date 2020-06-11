exports.updateUserData = function(app, guildID, collection, filter, update, user) {
    // Update user data for both the guild and the channel
    // Then check if the user has enough score for a new role

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
    // Try to find a Roles document in the Config collection
    
    app.mongodb.read(
        app.mongoClient,
        guildID,
        'Config',
        { _id: 'Roles' }
    )
    .then(data => {
        var roles;
        const userScore = userData.score;

        // Check if guild has custom set roles, if not use default from config.json

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