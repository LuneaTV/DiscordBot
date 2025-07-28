const { AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuOptionBuilder, StringSelectMenuBuilder
} = require('discord.js');
const Jimp = require("jimp");
const axios = require("axios");
const fs = require("fs");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('tournament-send-custom-btn')
        .setType(ApplicationCommandType.Message),
    async button(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;
        const matchId = interaction.customId.split("_")[1]

        const select = new StringSelectMenuBuilder()
            .setCustomId('tournament-send-custom-select_winner_' + matchId)
            .setPlaceholder("Sélectionner l'équipe gagnante")

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
    }
}