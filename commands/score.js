module.exports = {
    name: 'score',
    description: 'display user score, upvotes, downvotes',
    aliases: ['upvotes', 'downvotes'],
    execute(message, args, discordClient) {
        if (!message.mentions.users.size) {
            discordClient.mongodb_read.read(
                discordClient.mongoClient,
                message.guild.id,
                'Users',
                {_id: message.author.id}
            )
            .then(data => {
                if (Object.keys(data).length === 0) {
                    sendMessage(`Could not find Your score, sorry!`);
                }
                else {
                    sendMessage(`Your score is \`${data[message.author.id].score}\`, upvotes: \`${data[message.author.id].upvotes}\`, downvotes: \`${data[message.author.id].downvotes}\``);
                };
            })
            .catch(err => {console.error(err)});
        }
        else {
            var ids = [];
            message.mentions.users.map(user => {
                ids.push(user.id)
            });
            discordClient.mongodb_read.read(
                discordClient.mongoClient,
                message.guild.id,
                message.channel.id,
                {_id: {$in: ids}},
            )
            .then(data => {
                //check if data has been returned for each user

                // send message with reply
            })
            .catch(err => {console.error(err)});
        }

        function sendMessage(reply) {
            if (args.includes('DM')) {
                return message.author.send(reply);
            }
            return message.channel.send(reply);
        }
    },
};