module.exports = {
    name: 'score',
    description: 'Replies with user(s) score, upvotes, downvotes',
    aliases: ['upvotes', 'downvotes'],
    execute(message, args, discordClient) {
        if (message.channel.type === 'dm') {
            return message.channel.send('You must ask for score in the server for witch you want to get the score');
        };

        const mongoClient = discordClient.mongoClient;
        const mongodb = message.guild.id;
        var mongoCollection;
        var mongoFilter;
        var hasMentions;
        var reply;

        // Set mongoCollection & hasMentions value
        if (!message.mentions.channels.size) {
            mongoCollection = 'Users';
        }
        else {
            if (message.mentions.channels.size > 1) {
                return message.channel.send('Please only mention only one channel');
            }
            mongoCollection = message.mentions.channels.first().id;
        };

        //Set mongoFilter value
        if (!message.mentions.users.size) {
            mongoFilter = {_id: message.author.id};
            hasMentions = false;
        }
        else {
            const array = message.mentions.users.map(user => {
                return user.id;
            })
            mongoFilter = {_id: {$in: array}};
            hasMentions = true;
        };

        // Ask for data and process it
        discordClient.mongodb_read.read(
            mongoClient,
            mongodb,
            mongoCollection,
            mongoFilter
        )
        .then(data => {
            if (!data.length) {
            return message.channel.send('I could not find anything, sorry!');
            };
            if (hasMentions) {
                reply = message.mentions.users.map(user => {
                    if (!data.some(e => e._id == user.id)) {
                        return `Could not find ${user.username}'s score`;
                    };
                    let userData = data.find(e => e._id == user.id);
                    return `${user.username}'s score is \`${userData.score}\`, upvotes: \`${userData.upvotes}\`, downvotes: \`${userData.downvotes}\``;
                });
            }
            else {
                reply = `Your score is \`${data[0].score}\`, upvotes: \`${data[0].upvotes}\`, downvotes: \`${data[0].downvotes}\``;
            };
            return message.channel.send(reply);
        })
        .catch(console.error);
    },
};