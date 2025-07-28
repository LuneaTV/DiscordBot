const { AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ModalBuilder, TextInputBuilder, TextInputStyle
} = require('discord.js');
const Jimp = require("jimp");
const axios = require("axios");
const fs = require("fs");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('send-custom-select')
        .setType(ApplicationCommandType.Message),
    async select(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;
        const type = interaction.customId.split("_")[1]
        const matchId = interaction.customId.split("_")[2]

        if (type === "winner") {
            const select = new StringSelectMenuBuilder()
                .setCustomId(`tournament-send-custom-select_loser_${matchId}_${interaction.values[0]}`)
                .setPlaceholder("Sélectionner l'équipe perdante")

            const teams = await LUN.db.teams.getAll()

            teams.forEach(team => {
                select.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(team.name)
                        .setValue(team.id.toString()),
                );
            })

            const row = new ActionRowBuilder()
                .addComponents(select);

            await interaction.reply({
                components: [row],
                ephemeral: true
            });
        } else if (type === "loser")  {
            const winner = interaction.customId.split("_")[3]

            const select = new StringSelectMenuBuilder()
                .setCustomId(`tournament-send-custom-select_series_${matchId}_${winner}_${interaction.values[0]}`)
                .setPlaceholder("Est-ce que l'équipe gagnante a win la série ?")
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Oui")
                        .setValue("true"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Non")
                        .setValue("false"),
                    new StringSelectMenuOptionBuilder()
                        .setLabel("Aucun n'a gagné")
                        .setValue("none"),
                );

            const row = new ActionRowBuilder()
                .addComponents(select);

            await interaction.reply({
                components: [row],
                ephemeral: true
            });
        } else {
            const matchId = interaction.customId.split("_")[2]
            const winnerId = interaction.customId.split("_")[3]
            const loserId = interaction.customId.split("_")[4]
            const hasWonSeries = interaction.values[0]

            const modal = new ModalBuilder()
                .setCustomId(`send-custom-modal_${matchId}_${winnerId}_${loserId}_${hasWonSeries}`)
                .setTitle('Envoyer le match');

            const textInput = new TextInputBuilder()
                .setCustomId('extraText')
                .setLabel("Texte du message")
                .setPlaceholder("Entrez le text à ajouter")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(false);

            const subtitleInput = new TextInputBuilder()
                .setCustomId('subtitle')
                .setLabel("Sous titre de l'image")
                .setPlaceholder("Entrez le text à ajouter")
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

            const textRow = new ActionRowBuilder().addComponents(textInput);
            const subtitleRow = new ActionRowBuilder().addComponents(subtitleInput);

            modal.addComponents(textRow, subtitleRow);

            await interaction.showModal(modal);
        }
    }
}