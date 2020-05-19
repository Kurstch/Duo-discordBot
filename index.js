const Discord = require('discord.js');
const {prefix, token, mongodburl} = require('./config/config.json');
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
discordClient.mongodb_update = require('./db/mongodb_update');
discordClient.mongodb_read = require('./db/mongodb_read');

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
    if (user.bot) return;

    if (reaction.emoji.name === '👍') {
        discordClient.mongodb_update.update(discordClient.mongoClient,
            reaction.message.guild.id,
            reaction.message.channel.id,
            reaction.message.author.id,
            1, 1, 0);
    }
    else if (reaction.emoji.name === '👎') {
        discordClient.mongodb_update.update(discordClient.mongoClient,
            reaction.message.guild.id,
            reaction.message.channel.id,
            reaction.message.author.id,
            -1, 0, 1);
    };
});
discordClient.on('messageReactionRemove', (reaction, user) => {
    if (user.bot) return;

    let author = reaction.message.author;

    if (reaction.emoji.name === '👍') {
        discordClient.mongodb_update.update(discordClient.mongoClient,
            reaction.message.guild.id,
            reaction.message.channel.id,
            reaction.message.author.id,
            -1, -1, 0);
    }
    else if (reaction.emoji.name === '👎') {
        discordClient.mongodb_update.update(discordClient.mongoClient,
            reaction.message.guild.id,
            reaction.message.channel.id,
            reaction.message.author.id,
            1, 0, -1);
    };
});

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