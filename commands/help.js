module.exports = {
    name: 'help',
    execute(message, args, app) {
        const embed = new app.discord.MessageEmbed()
        .setTitle('Dashboard')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=710067353227886612&redirect_uri=http%3A%2F%2F192.168.43.243%3A8000%2Findex&response_type=token&scope=identify%20guilds')
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