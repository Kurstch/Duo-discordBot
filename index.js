const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const client = new Discord.Client();

const fs = require('fs');
client.userData = require('./userData.json');
client.commands = new Discord.Collection;

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
};

client.login(token);

client.once('ready', () => {
    //get all messages
    try {
        let channels = client.channels.cache.filter(c => c.type == 'text').array();
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

client.on('messageReactionAdd', (reaction, user) => {
    if (user.bot) return;

    let author = reaction.message.author;

    if (reaction.emoji.name === '👍') {
        updateUserData(author, 1, 1, 0);
    }
    else if (reaction.emoji.name === '👎') {
        updateUserData(author, -1, 0, 1);
    };
});
client.on('messageReactionRemove', (reaction, user) => {
    if (user.bot) return;

    let author = reaction.message.author;

    if (reaction.emoji.name === '👍') {
        updateUserData(author, -1, -1, 0);
    }
    else if (reaction.emoji.name === '👎') {
        updateUserData(author, 1, 0, -1);
    };
});

function updateUserData(author, scoreChange, upvotesChange, downvotesChange) {
    if (!client.userData[author.id]) {
        client.userData[author.id] = {
            score: 0,
            upvotes: 0,
            downvotes: 0
        };
    };
    client.userData[author.id] = {
        score: client.userData[author.id].score + scoreChange,
        upvotes: client.userData[author.id].upvotes + upvotesChange,
        downvotes: client.userData[author.id].downvotes + downvotesChange
    };
    fs.writeFile('./userData.json', JSON.stringify(client.userData, null, 4), err => {
        if (err) throw err;
    });
};

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // check if command exists, check for aliases
    const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

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
        command.execute(message, args, client);
    }
    catch (err) {
        console.log(message.content);
        console.error(err);
    };
});