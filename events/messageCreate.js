const fs = require('fs');
const https = require('https');

module.exports = {
    type: "messageCreate",
    once: false,
    async callback(message) {
        if (message.author.bot === true) return;
        if (message.guild.id !== LUN.config.guildID) return;


        const member = await LUN.guild.members.cache.get(message.author.id)

        let newMessage = LUN.lang.messages.playbooks.sommaire
        if (LUN.config.channel.playbooks.includes(message.channel.parentId)) {
            await message.channel.messages.fetch({
                limit: 100
            }).then(async (messages) => {
                let defZone = LUN.lang.messages.playbooks.defense
                let atkZone =  LUN.lang.messages.playbooks.attaque
                let otherZone =  LUN.lang.messages.playbooks.other

                messages.reverse().forEach((botMessage) => {
                    if (botMessage.content.startsWith("# ") && botMessage.author.id !== LUN.config.clientID) {
                        if (botMessage.content.includes("(Défense)")) {
                            defZone += LUN.lang.messages.playbooks.line.replace("%m", `https://discord.com/channels/${botMessage.guild.id}/${botMessage.channel.id}/${botMessage.id}`).replace("%t", botMessage.content.split("\n")[0].replace("# ", "").replace(" (Défense)", ""))
                        } else if (botMessage.content.includes("(Attaque)")) {
                            atkZone += LUN.lang.messages.playbooks.line.replace("%m", `https://discord.com/channels/${botMessage.guild.id}/${botMessage.channel.id}/${botMessage.id}`).replace("%t", botMessage.content.split("\n")[0].replace("# ", "").replace(" (Attaque)", ""))
                        } else {
                            otherZone += LUN.lang.messages.playbooks.line.replace("%m", `https://discord.com/channels/${botMessage.guild.id}/${botMessage.channel.id}/${botMessage.id}`).replace("%t", botMessage.content.split("\n")[0].replace("# ", ""))
                        }
                    }

                    if (botMessage.author.id === LUN.config.clientID) {
                        try {
                            LUN.bulkDeleted.push(botMessage.id)
                            botMessage.delete();
                        } catch (err) {
                            LUN.db.logs(1, "Playbooks - Sommaire", "Impossible de supprimer le message : " + err)
                        }
                    }
                })

                await LUN.utils.sleep(3000)
                message.channel.send(newMessage + defZone + atkZone + otherZone + LUN.lang.messages.playbooks.end)
                if (message.content === "update") message.delete()
            })
        }
    }
}