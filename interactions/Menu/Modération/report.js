const { TextInputStyle, TextInputBuilder, ModalBuilder, ContextMenuCommandBuilder, ApplicationCommandType, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Signaler le message')
        .setType(ApplicationCommandType.Message),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        try {
            LUN.db.logs(3, "Commande - report", `Lancement de la commande report par ${interaction.user.id}`)
        } catch (err) {
            LUN.db.logs(3, "Commande - report", `Lancement de la commande report par un utilisateur inconnu`)
        }

        const modal = new ModalBuilder()
            .setCustomId('report_' + interaction.targetId)
            .setTitle('Signaler un message');


        const reportInput = new TextInputBuilder()
            .setCustomId('reportMsg')
            .setLabel("Merci de décrire la raison")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(new ActionRowBuilder().addComponents(reportInput));

        await interaction.showModal(modal);

        LUN.db.logs(3, "Commande - clear", "Fin d'execution de la commande report")
    },
}

