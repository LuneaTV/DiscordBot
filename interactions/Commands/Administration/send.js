const { PermissionFlagsBits, SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Le texte')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        if (interaction.member.id === LUN.config.devID) {
            try {
                await interaction.channel.send(interaction.options._hoistedOptions[0].value)
            } catch (err) {
                await interaction.editReply({ content: LUN.config.emotes.error + LUN.lang.error.unknow, ephemeral: true });
                LUN.db.logs(1, "Commande - send", err)
                throw err;
            }

            await interaction.editReply({ content: LUN.config.emotes.success + "Envoie du message avec succès", ephemeral: true });
        } else {
            await interaction.editReply({ content: LUN.config.emotes.error + "T'as pas les droits connard", ephemeral: true });
        }
    }
}