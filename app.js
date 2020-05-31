const Discord = require('discord.js');
const MongoClient = require('mongodb').MongoClient;
const Config = require('./config/config.json');
const WS = require('./ws/ws');
const fs = require('fs');


class App {
    constructor() {
        this.discord = Discord;
        this.discordClient = new Discord.Client();

        this.config = Config;
        
        this.mongodb = require('./db/mongodb');
        MongoClient.connect(
            Config.mongodburi,
            { useNewUrlParser: true, useUnifiedTopology: true },
            (err, mongoClient) => {
                if (err) throw console.error(err)
                this.mongoClient = mongoClient;
            }
        );

        this.commands = new Discord.Collection();
        const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
        for (var file of commandFiles) {
            var command = require(`./commands/${file}`);
            this.commands.set(command.name, command);
        }

        this.vote_reaction = require('./reactions/upvote_downvote');

        this.ws = new WS(this);
    }
}

module.exports = App;