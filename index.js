//#region initialize variables

const Discord = require('discord.js');
const {prefix, upvoteEmoji, downvoteEmoji, token, mongodburl} = require('./config/config.json');
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
        {$inc: {score: change[0], upvotes: change[1], downvotes: change[2]}}
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
        {$inc: {score: change[0], upvotes: change[1], downvotes: change[2]}}
    );
});

function updateUserData(guildID, collection, filter, update) {
    discordClient.mongodb.update(
        discordClient.mongoClient,
        guildID,
        'Users',
        filter,
        update
    );
    discordClient.mongodb.update(
        discordClient.mongoClient,
        guildID,
        collection,
        filter,
        update
    );
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