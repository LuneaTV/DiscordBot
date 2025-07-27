const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getcustom_player')
        .setDescription("Récupérer la dernière game custom d'un joueur")
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .addMentionableOption(option =>
            option.setName('membre')
                .setDescription('Mentionnez la game de qui vous voulez voir')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        try {
            LUN.db.logs(3, "Commande - get_last_custom", `Lancement par ${interaction.user.id}`)
        } catch (err) {
            LUN.db.logs(3, "Commande - get_last_custom", `Lancement par un utilisateur inconnu`)
        }
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        let hasAccess = false
        await LUN.config.allowList.sendCustom.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true})



        const profile = await LUN.db.valorant.get(interaction.options._hoistedOptions[0].member.id)
        if (profile.length === 0) return interaction.editReply({content: LUN.config.emotes.error + " Joueur inconnu", ephemeral: true})

        const lastMatches = await LUN.valorant.lastCustomGame(profile[0].gameId)
        const matchDetails = lastMatches[0]

        let allyTeam = undefined
        let enemyTeam = undefined
        let won;

        if (!matchDetails) return interaction.editReply({content: LUN.config.emotes.error + " Impossible de trouver une game", ephemeral: true})

        matchDetails.players.forEach((player) => {
            if (player.puuid === profile[0].gameId) {
                matchDetails.teams.forEach((team) => {
                    if (team.team_id === player.team_id) {
                        allyTeam = team
                        won = team.won
                    } else {
                        enemyTeam = team
                    }
                })
                return;
            }
        })

        const date = await LUN.utils.formatDate(new Date(matchDetails.metadata.started_at))

        const message = `### Une partie a été trouvée : \n\nDate : ${date}\n\nRésultat : ${won ? "Victoire" : "Défaite"}\n\nScore : ${allyTeam.rounds.won} - ${allyTeam.rounds.lost}`

        let row = new ActionRowBuilder()

        const button = new ButtonBuilder()
            .setCustomId(`send-custom-btn_${matchDetails.metadata.match_id}_${won}`)
            .setLabel('Envoyer le match')
            .setEmoji("📩")
            .setStyle(ButtonStyle.Primary);
        row.addComponents(button);

        await interaction.editReply({content: message, components: [row], ephemeral: true})
    }
}