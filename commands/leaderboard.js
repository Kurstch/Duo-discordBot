module.exports = {
    name: 'leaderboard',
    description: 'Reply with a leaderboard of users + user scores, upvotes, downvotes',
    aliases: ['lead'],
    execute(message, args, app) {
        if (message.channel.type === 'dm') {
            return message.channel.send('You must ask for leaderboard in the server for witch you want to get the leaderboard');
        }

        var mongoCollection;
        var embedTitle;

        // Set mongoCollection and embedTitle values

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
        }

        app.mongodb.read(
            app.mongoClient,
            message.guild.id,
            mongoCollection,
            {}
        )
        .then(data => {

            // Loop through all users in the guild, get their data from mongo and insert it into leaderboardData array

            const leaderboardData = message.guild.members.cache
            .filter(e => e.user.bot === false)
            .map(user => {
                if (!data.some(e => e._id == user.id)) {
                    return {
                        userMention: user,
                        score: 0,
                        upvotes: 0,
                        downvotes: 0
                    }
                }
                const userData = data.find(e => e._id == user.id);
                return {
                    userMention: user,
                    score: userData.score,
                    upvotes: userData.upvotes,
                    downvotes: userData.downvotes
                }
            });

            // Sort leaderboardData

            if (args.includes('upvotes')) {
                leaderboardData.sort((a, b) => {
                    return a.upvotes - b.upvotes;
                });
            }
            else if (args.includes('downvotes')) {
                leaderboardData.sort((a, b) => {
                    return a.downvotes - b.downvotes;
                });
            }
            else {
                leaderboardData.sort((a, b) => {
                    return a.score - b.score;
                });
            }
            leaderboardData.reverse();

            // Lefine embed field values
            // Since discord embeds only allow 3 fields in one line, combine upvotes and downvotes into one field
            
            const usersFieldValue = leaderboardData.map(user => {
                return user.userMention;
            });
            const scoreFieldValue = leaderboardData.map(user => {
                return user.score;
            });
            const upvotesDownvotesFieldValue = leaderboardData.map(user => {
                return `${user.upvotes} / ${user.downvotes}`
            });

            const embed = new app.discord.MessageEmbed()
            .setTitle(embedTitle)
            .addFields(
                {name: 'Users', value: usersFieldValue, inline: true},
                {name: 'Score', value: scoreFieldValue, inline: true},
                {name: 'Upvotes/Downvotes', value: upvotesDownvotesFieldValue, inline: true}
            )
            .setColor('ORANGE');
            return message.channel.send(embed);
        })
        .catch(err => {console.error(err)});
    }
}