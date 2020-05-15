module.exports = {
    name: 'score',
    description: 'display user score, upvotes, downvotes',
    aliases: ['upvotes', 'downvotes'],
    execute(message, args, client) {
        if (!message.mentions.users.size) {
            if (!client.userData[message.author.id]) {
                return message.channel.send('You do not have a score yet');
            }
            return message.channel.send(`Your score is \`${client.userData[message.author.id].score}\`, upvotes: \`${client.userData[message.author.id].upvotes}\`, downvotes: \`${client.userData[message.author.id].downvotes}\``)
        }
        
        const scoreList = message.mentions.users.map(user => {
            if (!client.userData[user.id]) {
                return `${user.username} doesn't have a score yet`;
            }
            return `${user.username}'s score is \`${client.userData[user.id].score}\`, upvotes: \`${client.userData[user.id].upvotes}\`, downvotes: \`${client.userData[user.id].downvotes}\``;
        });

        message.channel.send(scoreList);
    },
};