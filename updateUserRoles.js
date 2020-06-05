module.exports.updateUserRoles = (roles, user, userScore) => {
    var roleObject = null;

    // check if user has enough score
    for (var i = 0; i < Object.keys(roles).length; i++) {
        const role = roles['Rank' + i];
        if (userScore >= role.score) {
            roleObject = role;
            break;
        }
    }
    if (roleObject === null) return;

    // check if user has any of the autoroles
    for (const role of user.roles.cache) {
        if (role[1].name == '@everyone') continue;
        for (var i = 0; i < Object.keys(roles).length; i++) {
            const r = roles['Rank' + i];
            if (r.name == role[1].name && role[1].name != roleObject.name) {
                user.roles.remove(role);
            }              
        }
    }

    // grant user the role
    var role = user.guild.roles.cache.find(role => role.name === roleObject.name);
    if (role == undefined) {
        role = user.guild.roles.create({
            data: {
                name: roleObject.name,
                color: roleObject.color,
            },
            reason: roleObject.reason,
        })
        .then(r => {
            user.roles.add(r)
        })
        .catch(err => console.error(err));
    }
    else user.roles.add(role);

    return role;
}
