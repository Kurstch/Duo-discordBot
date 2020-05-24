//#region initialize variables

const Discord = require('discord.js');
const {prefix, upvoteEmoji, downvoteEmoji, defaultRoles, token, mongodburl} = require('./config/config.json');
const discordClient = new Discord.Client();

const fs = require('fs');
discordClient.commands = new Discord.Collection;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    discordClient.commands.set(command.name, command);
};

const MongoClient = require('mongodb').MongoClient;
 MongoClient.connect(mongodburl, {useNewUrlParser: true, useUnifiedTopology:true}, (err, client) => {
    if (err) throw err;
    discordClient.mongoClient = client;
});
discordClient.mongodb = require('./db/mongodb');

//#endregion

discordClient.login(token);

discordClient.once('ready', () => {
    //get all messages
    try {
        let channels = discordClient.channels.cache.filter(c => c.type == 'text').array();
        for (let channel of channels) {
            channel.fetch()
            .then(c => {
                c.messages.fetch();
            }).catch(console.error);
        };
    }
    catch {
        console.error;
    };
    console.log('client is ready'); 
});

discordClient.on('messageReactionAdd', (reaction, user) => {
    if (user.bot || user === reaction.message.author || reaction.message.author.bot) return;

    var change;

    if (upvoteEmoji.includes(reaction.emoji.name)) {
        change = [1, 1, 0]
    }
    else if (downvoteEmoji.includes(reaction.emoji.name)) {
        change = [-1, 0, 1]
    }
    else return;

    updateUserData(
        reaction.message.guild.id,
        reaction.message.channel.id,
        {_id: reaction.message.author.id},
        {$inc: {score: change[0], upvotes: change[1], downvotes: change[2]}},
        reaction.message.member
    );
});

discordClient.on('messageReactionRemove', (reaction, user) => {
    if (user.bot || user === reaction.message.author || reaction.message.author.bot) return;

    var change;

    if (upvoteEmoji.includes(reaction.emoji.name)) {
        change = [-1, -1, 0]
    }
    else if (downvoteEmoji.includes(reaction.emoji.name)) {
        change = [1, 0, -1]
    }
    else return;

    updateUserData(
        reaction.message.guild.id,
        reaction.message.channel.id,
        {_id: reaction.message.author.id},
        {$inc: {score: change[0], upvotes: change[1], downvotes: change[2]}},
        reaction.message.member
    );
});

function updateUserData(guildID, collection, filter, update, user) {
    discordClient.mongodb.update(
        discordClient.mongoClient,
        guildID,
        'Users',
        filter,
        update
    )
    .then(data => {
        checkForRoleUpdate(guildID, data.value, user);
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

function checkForRoleUpdate(guildID, userData, user) {
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

discordClient.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // check if command exists, check for aliases
    const command = discordClient.commands.get(commandName)
		|| discordClient.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    // Check if arguments are necessary and are provided
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nYou must write \`${prefix}${commandName}\` + ${command.usage}`;
        };

        return message.channel.send(reply);
    }

    try {
        command.execute(message, args, discordClient);
    }
    catch (err) {
        console.log(message.content);
        console.error(err);
    };
});