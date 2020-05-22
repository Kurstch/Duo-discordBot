module.exports = {
    name: 'leaderboard',
    description: 'Reply with a leaderboard of users + user scores, upvotes, downvotes',
    aliases: ['lead'],
    execute(message, args, discordClient) {
        if (message.channel.type === 'dm') {
            return message.channel.send('You must ask for leaderboard in the server for witch you want to get the leaderboard');
        };

        const Discord = require('discord.js');
        const mongoClient = discordClient.mongoClient;
        const mongodb = message.guild.id;
        var mongoCollection;
        var mongoFilter = {};
        var embedTitle;

        // Set mongoCollection & hasMentions value
        if (!message.mentions.channels.size) {
            mongoCollection = 'Users';
            embedTitle = 'Server leaderboard';
        }
        else {
            if (message.mentions.channels.size > 1) {
                return message.channel.send('Please only mention only one channel');
            }
            mongoCollection = message.mentions.channels.first().id;
            embedTitle = `${message.mentions.channels.first().name} channel leaderboard`
        };

        discordClient.mongodb.read(
            mongoClient,
            mongodb,
            mongoCollection,
            mongoFilter
        )
        .then(data => {
            var leaderboardData = message.guild.members.cache.map(user => {
                if (!data.some(e => e._id == user.id)) {
                    return {
                        userMention: user,
                        score: 0,
                        upvotes: 0,
                        downvotes: 0
                    };
                };
                let userData = data.find(e => e._id == user.id);
                return {
                    userMention: user,
                    score: userData.score,
                    upvotes: userData.upvotes,
                    downvotes: userData.downvotes
                };
            });

            if (args.includes('upvotes')) {
                leaderboardData.sort(function(a, b) {
                    return a.upvotes - b.upvotes;
                });
            }
            else if (args.includes('downvotes')) {
                leaderboardData.sort(function(a, b) {
                    return a.downvotes - b.downvotes;
                });
            }
            else {
                leaderboardData.sort(function(a, b) {
                    return a.score - b.score;
                });
            };
            leaderboardData.reverse();

            var usersFieldValue = leaderboardData.map(user => {
                return user.userMention;
            });
            var scoreFieldValue = leaderboardData.map(user => {
                return user.score;
            });
            var upvotesDownvotesFieldValue = leaderboardData.map(user => {
                return `${user.upvotes}/${user.downvotes}`
            });

            const embed = new Discord.MessageEmbed()
            .setTitle(embedTitle)
            .addFields(
                {name: 'Users', value: usersFieldValue, inline: true},
                {name: 'Score', value: scoreFieldValue, inline: true},
                {name: 'Upvotes/Downvotes', value: upvotesDownvotesFieldValue, inline: true}
            );
            return message.channel.send(embed);
        })
        .catch(console.error);
    },
};