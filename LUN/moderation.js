const {EmbedBuilder} = require("discord.js");
const colors = {
    1: "#7337b1", // Basique
    2: "#d58d04", // Attention
    3: "#7a0202", // Majeur
}

module.exports = {
    async mod(title, details, ping, level, channelID, attachments) {
        const LogID = await LUN.db.logs(4, title, details)

        let content = ""
        const files = []
        const embed = new EmbedBuilder()
            .setColor(colors[level])
            .setTimestamp()
            .setFooter({ text: `LogID : ${LogID === -1 ? "Erreur" : LogID}`, iconURL: LUN.client.user.avatarURL() })

        if (title === null || details === null) {
            return LUN.db.logs(1, "Modération (Mod)", "Erreur : Le titre ou la description n'est pas présente, titre : " + title + " | détails : " + details)
        }

        if (ping) {
            content += "@everyone"
        }

        if (details.length > 1500) {
            if (attachments && attachments.first()) {
                attachments.forEach(attachment => {
                    files.push(attachment.url)
                })

                LUN.channels.mod.send({content: "Erreur : Une log de modération est trop longue\n-# LogID: " + LogID, files: files})
            } else {
                LUN.channels.mod.send({content: "Erreur : Une log de modération est trop longue\n-# LogID: " + LogID, files: files})
            }
            return
        }

        try {
            embed.addFields({name: title, value: details})
        } catch (err) {
            LUN.db.logs(1, "Modération (Mod)", err)
            return err
        }

        if (details.length > 1500) {
            if (attachments && attachments.first()) {
                attachments.forEach(attachment => {
                    files.push(attachment.url)
                })

                LUN.channels.mod.send({content: "Erreur : Une log est trop longue\n-# LogID: " + LogID, files: files})
            } else {
                LUN.channels.mod.send({content: "Erreur : Une log est trop longue\n-# LogID: " + LogID, files: files})
            }
            return
        }


        try {
            if (attachments && attachments.first()) {
                attachments.forEach(attachment => {
                    files.push(attachment.url)
                })

                LUN.channels.mod.send({content: content, embeds: [embed], files: files})
            } else {
                LUN.channels.mod.send({content: content, embeds: [embed]})
            }
        } catch (err) {
            LUN.db.logs(1, "Modération (Mod)", err)
            return err
        }
    },
    async log(title, details, ping, level, channelID, attachments) {
        const LogID = await LUN.db.logs(4, title, details)

        let content = ""
        const files = []
        const embed = new EmbedBuilder()
            .setColor(colors[level])
            .setTimestamp()
            .setFooter({ text: `LogID : ${LogID === -1 ? "Erreur" : LogID}`, iconURL: LUN.client.user.avatarURL() })

        if (title === null || details === null) {
            return LUN.db.logs(1, "Modération (Log)", "Erreur : Le titre ou la description n'est pas présente, titre : " + title + " | détails : " + details)
        }

        if (ping) {
            content += "@everyone"
        }

        try {
            embed.addFields({name: title, value: details})
        } catch (err) {
            LUN.db.logs(1, "Modération (Log)", err)
            return err
        }

        try {
            if (attachments && attachments.first()) {
                attachments.forEach(attachment => {
                    files.push(attachment.url)
                })

                LUN.channels.logs.send({content: content, embeds: [embed], files: files})
            } else {
                LUN.channels.logs.send({content: content, embeds: [embed]})
            }
        } catch (err) {
            LUN.db.logs(1, "Modération (Log)", err)
            return err
        }
    },
}