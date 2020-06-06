module.exports.updateUserRoles = (roles, user, userScore) => {
    var roleObject = null;

    // check if user has enough score
    for (var i = 0; i < Object.keys(roles).length; i++) {
        const role = roles['Rank' + i];
        if (userScore >= role.score) {
            roleObject = role;
            break;
        }
        else if (role == roles['Rank' + Object.keys(roles).length -1]) break;
    }

    // check if user has any of the autoroles
    for (const role of user.roles.cache) {
        if (role[1].name == '@everyone') continue;
        for (var i = 0; i < Object.keys(roles).length; i++) {
            const r = roles['Rank' + i];
            if (r.name == role[1].name) {
                user.roles.remove(role);
            }
        }
    }
    if (roleObject === null) return;

    // grant user the role
    var role = user.guild.roles.cache.find(role => role.name === roleObject.name);
    if (role == undefined) {
        role = user.guild.roles.create({
            data: {
                name: roleObject.name,
                color: roleObject.color,
            }
        })
        .then(r => {
            user.roles.add(r)
        })
        .catch(err => console.error(err));
    }
    else {
        role.edit({
            color: roleObject.color
        })

        user.roles.add(role);
    }

    return role;
}
