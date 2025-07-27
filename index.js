const fs = require('fs');
const mysql = require('mysql2/promise');
const cron = require('node-cron');
const path = require("path");

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildModeration] });

const myArgs = process.argv.slice(2);

global.__basedir = __dirname;
global.LUN = require('./LUN');

if (myArgs.length > 0 && myArgs[0] === "dev") {
    global.LUN = require('./LUN/dev');
    LUN.dev = true
    LUN.attachments = __dirname + "/attachments_dev"
    console.log("Launching in " + "\x1b[32mdeveloper\x1b[0m" + " mode\n")
} else {
    LUN.dev = false
    LUN.attachments = __dirname + "/../Dashboard/storage/app/private/attachments"
    console.log("Launching in " + "\x1b[34mproduction\x1b[0m" + " mode\n")
}

process.on('uncaughtException', function (err) {
    console.error(err);
});

async function initDB() {
    const db = await mysql.createConnection({
        host: LUN.pass.DB_Host,
        user: LUN.pass.DB_User,
        port: LUN.pass.DB_Port,
        password: LUN.pass.DB_Password,
        database: LUN.pass.DB_Name,
        queueLimit: 0,
        supportBigNumbers: true,
        bigNumberStrings: true
    });

    console.log("\x1b[32m[Connecté]" + " \x1b[37mDB");

    LUN.sql = db;
}

initDB().catch((err) => {
    console.error('Erreur de connexion à la base de données :', err);
    process.exit(1); // arrêter si la DB ne répond pas
});

LUN.client = client;
LUN.commands = new Collection()
LUN.channels = {}
LUN.bulkDeleted = []
LUN.season = undefined
LUN.assets = __dirname + "/assets"

// Vider le dossier TMP
if (!LUN.dev) {
    fs.readdir("assets/tmp", (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.stat(path.join("assets/tmp/", file), (error, stats) => {
                // in case of any error
                if (error) {
                    console.log(error);
                    return;
                }

                const diffTime =  Math.abs(new Date() - new Date(stats.birthtime))
                if ((diffTime / (1000 * 60 * 60 * 24)) > 30) {
                    fs.unlink(path.join("assets/tmp/", file), (err) => {
                        if (err) throw err;
                    });
                }
            })
        }
    });
}

// Enregistrement des events
fs.readdirSync('events').forEach(file => {
    const event = require(`./events/${file}`);
    if(event.once) client.once(event.type, event.callback.bind(event));
    else client.on(event.type, event.callback.bind(event));
});

cron.schedule('0 20,21,22,23 * * *', async () => {
    if (!LUN.dev) {
        await LUN.utils.fetchPremierMatches()
    }
});

cron.schedule('0,30 * * * *', async () => {
    if (!LUN.dev) {
        await LUN.utils.updateVal();
    }
});

client.login(LUN.pass.DiscordToken)