exports.updateUserData = function(discordClient, guildID, collection, filter, update, user) {
    const {defaultRoles} = require('../config/config.json');

    discordClient.mongodb.update(
        discordClient.mongoClient,
        guildID,
        'Users',
        filter,
        update
    )
    .then(data => {
        checkForRoleUpdate(discordClient, guildID, data.value, user, defaultRoles);
    })
    .catch(console.error);
    discordClient.mongodb.update(
        discordClient.mongoClient,
        guildID,
        collection,
        filter,
        update
    );
};

function checkForRoleUpdate(discordClient, guildID, userData, user, defaultRoles) {
    // Try to find a document in the config collection
    // I will work out the filter once i decide how documents un the config collection will be sorted
    discordClient.mongodb.read(
        discordClient.mongoClient,
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
            const roleObject = checkIfUserHasEnoughScore(userScore, defaultRoles);
            if (roleObject === undefined) return;
            checkIfUserHasRole(defaultRoles, roleObject, user);
            addUserToRole(roleObject, user);
        };
    })
    .catch(console.error);

    function checkIfUserHasEnoughScore(userScore, roles) {
        for (var role of roles) {
            if (userScore > role.score) {return role;}
            else if (role == roles[roles.length - 1]) continue;
        }
    };

    function checkIfUserHasRole(roles, roleObject, user) {
        for (var role of user.roles.cache) {
            if (role[1].name == '@everyone') continue;
            for (var r of roles) {
                if (r.name == role[1].name && role[1].name != roleObject.name) {
                    user.roles.remove(role);
                };
            };
        };
    };

    function addUserToRole(roleObject, user) {
        var role = user.guild.roles.cache.find(r => r.name === roleObject.name);
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
            .catch(console.error);
        }
        else {
            user.roles.add(role);
        };
    };
};