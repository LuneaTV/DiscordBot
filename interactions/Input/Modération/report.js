const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('report')
        .setType(ApplicationCommandType.Message),
    async modal(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        try {
            LUN.channels.mod.send(LUN.lang.messages.report.replace("%e", interaction.member).replace("%m", `https://discord.com/channels/${LUN.config.guildID}/${interaction.channel.id}/${interaction.customId.split("_")[1]}`).replace("%t", interaction.fields.getTextInputValue("reportMsg")));
        } catch (err) {
            const LogID = await LUN.db.logs(1, "Input - Report (Envoie du message)", err)
            return interaction.reply({ content: LUN.config.emotes.error + LUN.lang.error.unknow + LogID, ephemeral: true });
        }

        LUN.db.logs(3, "Commande - report", "Signalement effectué de " + interaction.member.id)

        await interaction.reply({ content: LUN.config.emotes.success + "Le signalement a été envoyé !", ephemeral: true });
    },
}

