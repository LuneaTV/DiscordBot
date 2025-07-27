const fs = require("fs");

module.exports = {
    type: "ready",
    once: true,
    async callback() {
        const guild = await LUN.client.guilds.cache.get(LUN.config.guildID)
        const devGuild = LUN.client.guilds.cache.get("362215713160691713")

        let interactionNbr = 0
        fs.readdirSync(__basedir + '/interactions').forEach(typeDir => {
            fs.readdirSync(__basedir + '/interactions/' + typeDir).forEach(dir => {
                fs.readdirSync( __basedir + `/interactions/${typeDir}/${dir}`).filter(file => file.endsWith('.js')).forEach(file => {
                    const command = require(__basedir + `/interactions/${typeDir}/${dir}/${file}`);

                    if ('data' in command) {
                        let commandData = command.data.toJSON()
                        LUN.commands[commandData.name] = {"dir": dir, "cmd": command}
                        interactionNbr++
                    } else {
                        LUN.db.logs(1, "ready", `La commande de type ${typeDir} ${dir}/${file} n'a pas la propriété data.`)
                    }
                });
            });
        });

        //LUN.client.user.setPresence({ activities: [{ name: '#LUNWIN' }], status: 'dnd' });
        LUN.guild = guild
        LUN.channels.mod = await guild.channels.cache.get(LUN.config.channel.mod)
        LUN.channels.logs = await guild.channels.cache.get(LUN.config.channel.logs)
        LUN.channels.errlog = await devGuild.channels.cache.get("1349140185539023030")

        console.log("\x1b[32m[Connecté]" + " \x1b[34mDiscord \x1b[0m")
        console.log("\x1b[34m[Interaction]" + `\x1b[0m Chargement de \x1b[34m${interactionNbr}\x1b[0m interactions \x1b[0m`)

        if (LUN.dev === false) {
            devGuild.channels.cache.get("1340648973106417665").send("Démarrage du bot en production")
        }

        await LUN.utils.registerCommands()
        //await LUN.utils.fetchPremierMatches()
        //await LUN.utils.updateValRoster()
    }
}