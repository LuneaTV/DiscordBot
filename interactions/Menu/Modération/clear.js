const { PermissionFlagsBits, ContextMenuCommandBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Supprimer les messages')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        try {
            LUN.db.logs(3, "Commande - clear", `Lancement de la commande clear par ${interaction.user.id}`)
        } catch (err) {
            LUN.db.logs(3, "Commande - clear", `Lancement de la commande clear par un utilisateur inconnu`)
        }
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        let row = new ActionRowBuilder()

        try {
            const confirmBtn = new ButtonBuilder()
                .setCustomId("clear_" + interaction.targetId)
                .setLabel('Confirmer')
                .setEmoji(LUN.config.emotes.white_ok)
                .setStyle(ButtonStyle.Success);

            const cancelBtn = new ButtonBuilder()
                .setCustomId(`clear_cancel`)
                .setLabel('Annuler')
                .setEmoji(LUN.config.emotes.white_x)
                .setStyle(ButtonStyle.Danger);

            row.addComponents(confirmBtn);
            row.addComponents(cancelBtn);
        } catch (err) {
            const LogID = await LUN.db.logs(1, "Menu - clear (Ajout des boutons)", err)
            return interaction.editReply({ content: LUN.config.emotes.error + LUN.lang.error.unknow + LogID, ephemeral: true });
        }

        await interaction.editReply({ content: LUN.config.emotes.loading + " Vous êtes sur le point de supprimer tous les messages envoyés après ce dernier, êtes-vous sur de vouloir continuer ?", components: [row], ephemeral: true });
        LUN.db.logs(3, "Commande - clear", "Fin d'execution de la commande clear")
    },
}

