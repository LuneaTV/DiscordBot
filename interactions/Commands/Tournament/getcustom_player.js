const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tournament')
        .setDescription("Différents utilitaires pour les tournois")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('custom')
                .setDescription('Lancer une custom game')
                .addStringOption(option =>
                    option.setName('valid')
                        .setDescription('Compte de l\'un des joueurs')
                        .setRequired(true))),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        try {
            LUN.db.logs(4, `Commande - get_last_custom : Lancement par ${interaction.user.id}`)
        } catch (err) {
            LUN.db.logs(4, `Commande - get_last_custom : Lancement par un utilisateur inconnu`)
        }

        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        if (interaction.channel.parentId !== LUN.config.channel.tournamentCategory) return interaction.editReply({content: LUN.config.emotes.error + " Tu dois lancer la commande dans la catégorie de gestion de tournoi", ephemeral: true})

        const valProfile = await LUN.valorant.getProfileByName(interaction.options._hoistedOptions[0].value)

        if (!valProfile.puuid) return interaction.editReply({content: LUN.config.emotes.error + "Joueur inconnu", ephemeral: true})

        const lastMatches = await LUN.valorant.lastCustomGame(valProfile.puuid)
        let matchDetails = null
        for (match of lastMatches) {
            if (match.metadata.queue.mode_type === "Standard") {
                matchDetails = match
                break;
            }
        }

        if (!matchDetails) return interaction.editReply({content: LUN.config.emotes.error + "Impossible de trouver une game", ephemeral: true})


        const date = await LUN.utils.formatDate(new Date(matchDetails.metadata.started_at))

        const message = `### Une partie a été trouvée : \n\nDate : ${date}\n\nScore : ${matchDetails.teams[0].rounds.won} - ${matchDetails.teams[0].rounds.lost}`

        let row = new ActionRowBuilder()

        const button = new ButtonBuilder()
            .setCustomId(`tournament-send-custom-btn_${matchDetails.metadata.match_id}`)
            .setLabel('Envoyer le match')
            .setEmoji("📩")
            .setStyle(ButtonStyle.Primary);
        row.addComponents(button);

        await interaction.editReply({content: message, components: [row], ephemeral: true})
    }
}