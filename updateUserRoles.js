module.exports.updateUserRoles = async(roles, user, userScore) => {
    var roleObject = null;

    // Check if user has enough score
    // Must check seperatly for roles with positive and negative scores

    for (var i = 0; i < Object.keys(roles).length; i++) {
        const role = roles['Rank' + i];
        if (role.score < 0) {
            if (userScore <= role.score) {
                roleObject = role;
                break
            }
        }
        else {      
            if (userScore >= role.score) {
                roleObject = role;
                break;
            }
        }
    }

    // Check if user has any of the auto roles

    for (const role of user.roles.cache) {
        if (role[1].name == '@everyone') continue;
        for (var i = 0; i < Object.keys(roles).length; i++) {
            const r = roles['Rank' + i];
            if (role[1].name === r.name) {
                try {
                    if (role[1].name !== roleObject.name) {
                        await user.roles.remove(role);
                    }
                } // If there is an error (roleObject is null), that means user doesn't have enough score for any role and the role should be removed
                catch {await user.roles.remove(role);} 
            }
        }
    }
    if (roleObject === null) return;

    // Try to find the role in the guild

    var role = await user.guild.roles.cache.find(role => role.name === roleObject.name);

    var color;
    if (Array.isArray(roleObject.color)) color = roleObject.color;
    else color = roleObject.color.toUpperCase();

    if (role == undefined) {
        role = user.guild.roles.create({
            data: {
                name: roleObject.name,
                color: color
            }
        })
        .then(r => {
            user.roles.add(r)
        })
        .catch(err => console.error(err));
    }
    else {
        role.edit({
            color: color
        });
        user.roles.add(role);
    }

    // This is used to prevent bot from making multiple identical roles
    // Refer to ws.js:84
    return role;
}
