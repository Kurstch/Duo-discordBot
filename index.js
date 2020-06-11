const App = require('./app');
const app = new App();

app.discordClient.login(process.env.TOKEN);

app.discordClient.once('ready', () => {
    //get all messages
    try {
        let channels = app.discordClient.channels.cache.filter(c => c.type == 'text').array();
        for (let channel of channels) {
            channel.fetch()
            .then(c => {
                c.messages.fetch();
            }).catch(err => {console.error(err)});
        }
        app.discordClient.user.setActivity("_help", {type: "WATCHING"});
    }
    catch (err) {
        console.error(err);
    }
    console.log(`discordClient loged in as ${app.discordClient.user.username} ${app.discordClient.user}`); 
});

app.discordClient.on('messageReactionAdd', (reaction, user) => {
    if (user.bot || user === reaction.message.author || reaction.message.author.bot) return;

    var change;

    if (app.config.upvoteEmoji.includes(reaction.emoji.name)) {
        change = [1, 1, 0]
    }
    else if (app.config.downvoteEmoji.includes(reaction.emoji.name)) {
        change = [-1, 0, 1]
    }
    else return;

    app.vote_reaction.updateUserData(
        app,
        reaction.message.guild.id,
        reaction.message.channel.id,
        {_id: reaction.message.author.id},
        {$inc: {score: change[0], upvotes: change[1], downvotes: change[2]}},
        reaction.message.member
    );
});

app.discordClient.on('messageReactionRemove', (reaction, user) => {
    if (user.bot || user === reaction.message.author || reaction.message.author.bot) return;

    var change;

    if (app.config.upvoteEmoji.includes(reaction.emoji.name)) {
        change = [-1, -1, 0]
    }
    else if (app.config.downvoteEmoji.includes(reaction.emoji.name)) {
        change = [1, 0, -1]
    }
    else return;

    app.vote_reaction.updateUserData(
        app,
        reaction.message.guild.id,
        reaction.message.channel.id,
        {_id: reaction.message.author.id},
        {$inc: {score: change[0], upvotes: change[1], downvotes: change[2]}},
        reaction.message.member
    );
});

app.discordClient.on('message', message => {
    if (!message.content.startsWith(app.config.prefix) || message.author.bot) return;

    const args = message.content.slice(app.config.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    // check if command exists, check for aliases
    const command = app.commands.get(commandName)
	    || app.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
        command.execute(message, args, app);
    }
    catch (err) {
        console.log(message.content);
        console.error(err);
    };
});