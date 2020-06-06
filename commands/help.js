module.exports = {
    name: 'help',
    execute(message, args, app) {
        const embed = new app.discord.MessageEmbed()
        .setTitle('Dashboard')
        .setURL(app.config.ws.oauth2Redirect);

        message.channel.send(embed);
    },
}