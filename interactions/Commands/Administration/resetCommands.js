const { PermissionFlagsBits, SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetcmds')
        .setDescription('Réinitialiser les commandes.')
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        if (interaction.member.id === LUN.config.devID) {
            try {
                LUN.db.logs(3, "Commande - resetCmds", `Lancement de la commande resetCommands par ${interaction.user.id}`)
            } catch (err) {
                LUN.db.logs(3, "Commande - resetCmds", `Lancement de la commande resetCommands par un utilisateur inconnu`)
            }
            await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

            try {
                await LUN.utils.registerCommands()
            } catch (err) {
                const LogID = await LUN.db.logs(1, "Commande - resetCmds", err)
                await interaction.editReply({ content: LUN.config.emotes.error + LUN.lang.error.unknow + LogID, ephemeral: true });
                throw err;
            }

            await interaction.editReply({ content: LUN.config.emotes.success + LUN.lang.commands.resetCmds.success, ephemeral: true });
            LUN.db.logs(3, "Commande - resetCmds", 'Les commandes ont été réinitialisés !')
        } else {
            await interaction.reply({ content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true });
        }
    }
}