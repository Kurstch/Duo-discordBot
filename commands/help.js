module.exports = {
    name: 'help',
    execute(message, args, app) {
        const embed = new app.discord.MessageEmbed()
        .setTitle('Dashboard')
        .setURL('https://duo-discordbot.herokuapp.com/')
        .setDescription([
            'Vote by reacting with 👍 and 👎',
            '',
            '`_score (optional [@user mention] [#channel mention])`',
            'Get your score',
            'Get mentioned user(s) score',
            'Get score from a specific channel',
            '',
            '`_lead (optional [#channel mention] [downvotes])`',
            'Get server leaderboard',
            'Get channel leaderboard',
            'Sort leaderboard by downvotes'
        ])
        .setColor('ORANGE');
        message.channel.send(embed);
    },
}
