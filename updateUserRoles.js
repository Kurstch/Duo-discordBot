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

    // check if user has any of the autoroles
    for (const role of user.roles.cache) {
        if (role[1].name == '@everyone') continue;
        for (var i = 0; i < Object.keys(roles).length; i++) {
            const r = roles['Rank' + i];
            if (role[1].name === r.name) {
                try {
                    if (role[1].name !== roleObject.name) {
                        await user.roles.remove(role);
                    }
                }
                catch {await user.roles.remove(role);} // If there is an error (roleObject is null), that means user doesn't have enough score for any role 
            }
        }
    }
    if (roleObject === null) return;

    // grant user the role
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

    return role;
}
