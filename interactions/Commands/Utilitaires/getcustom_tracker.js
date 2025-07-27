const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getcustom_tracker')
        .setDescription("Récupérer une custom avec son lien tracker")
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .addStringOption(option =>
            option.setName('lien')
                .setDescription('Le lien sur tracker.gg')
                .setRequired(true))
        .addBooleanOption(option =>
            option.setName('victoire')
                .setDescription('Si la game a été gagnée')
                .setRequired(true)),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        try {
            LUN.db.logs(3, "Commande - post_custom", `Lancement par ${interaction.user.id}`)
        } catch (err) {
            LUN.db.logs(3, "Commande - post_custom", `Lancement par un utilisateur inconnu`)
        }
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        let hasAccess = false
        await LUN.config.allowList.sendCustom.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true})



        console.log(interaction.options._hoistedOptions[0].value)
        const trackerLink = interaction.options._hoistedOptions[0].value.split("/")

        const matchDetails = await LUN.valorant.getMatch(trackerLink[trackerLink.length - 1])

        let allyTeam = undefined
        let enemyTeam = undefined
        let won = interaction.options._hoistedOptions[1].value

        if (!matchDetails) return interaction.editReply({content: LUN.config.emotes.error + " Impossible de trouver la game", ephemeral: true})

        matchDetails.teams.forEach((team) => {
            if (team.won === won) {
                allyTeam = team
            } else {
                enemyTeam = team
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