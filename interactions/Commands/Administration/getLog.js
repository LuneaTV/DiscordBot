const { PermissionFlagsBits, SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Récupérer une log')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .addStringOption(option =>
            option.setName('logid')
                .setDescription('Identifiant de la log')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        const log = await LUN.db.getLog(interaction.options._hoistedOptions[0].value)
        if (log.length === 0) return interaction.editReply({ content: LUN.config.emotes.error + "Impossible d'accéder à cette log", ephemeral: true });

        if (log[0].type === 4 && !(interaction.member.roles.cache.has(LUN.config.roles.ceo) || interaction.member.roles.cache.has(LUN.config.roles.moderation) || interaction.member.id === LUN.config.devID)) return interaction.editReply({ content: LUN.config.emotes.error + "Impossible d'accéder à cette log", ephemeral: true });
        if (interaction.member.id !== LUN.config.devID && log[0].type !== 4) return interaction.editReply({ content: LUN.config.emotes.error + "Impossible d'accéder à cette log", ephemeral: true });

        const date = await LUN.utils.formatDate(new Date(log[0].time))
        let logType = "❓ Inconnu ❓"
        switch (log[0].type) {
            case 1:
                logType = "🔴 Erreur 🔴"
                break;
            case 2:
                logType = "🟠 Warning 🟠"
                break;
            case 3:
                logType = "🔵 Information 🔵"
                break;
            case 4:
                logType = "🟣 Modération 🟣"
                break;
        }

        try {
            await interaction.editReply({
                content: `${logType}\n###  ${log[0].module}\n` + "```" + log[0].messages + "```\n-# " + date,
                ephemeral: true
            });
        } catch (err) {
            if (err.rawError.code === 50035 ) return interaction.editReply({ content: LUN.config.emotes.error + "La log est trop longue", ephemeral: true });
            interaction.editReply({ content: LUN.config.emotes.error + "Une erreur inconnue est survenue", ephemeral: true });
        }
    }
}