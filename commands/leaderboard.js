module.exports = {
    name: 'leaderboard',
    description: 'send a DM with all user scores',
    aliases: ['lead'],
    args: true,
    usage: '`<server>` or `<#channel name>`',
    execute(message, args, client) {
        const Discord = require('discord.js');

        const userData = client.userData

        const embed = new Discord.MessageEmbed()
        .setTitle('Server leaderboard')
        .addFields(
            { name: 'user', value: 'Som', inline: true },
            { name: 'score', value: 'S', inline: true },
            { name: 'upvotes', value: 'af', inline: true},
            { name: 'downvotes', value: 'af', inline: true},
        );

        message.author.send(embed);
    },
};