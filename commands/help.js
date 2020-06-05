module.exports = {
    name: 'help',
    execute(message, args, app) {
        const embed = new app.discord.MessageEmbed()
        .setTitle('Dashboard')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=710067353227886612&redirect_uri=http%3A%2F%2F192.168.43.243%3A41206&response_type=token&scope=identify%20guilds');

        message.channel.send(embed);
    },
}