const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('teams')
        .setDescription("Gérer les équipes du tournoi")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Ajouter une équipe')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription("Donnez le nom de l'équipe")
                        .setRequired(true))),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        try {
            LUN.db.logs(4, `Commande - teams : Lancement par ${interaction.user.id}`)
        } catch (err) {
            LUN.db.logs(4, `Commande - teams : Lancement par un utilisateur inconnu`)
        }
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        if (interaction.channel.parentId !== LUN.config.channel.tournamentCategory) return interaction.editReply({content: LUN.config.emotes.error + "Tu dois lancer la commande dans la catégorie de gestion de tournoi", ephemeral: true})

        switch (interaction.options._subcommand) {
            case "add":
                this.add(interaction)
                break;
        }
    },
    async add(interaction) {
        await LUN.db.teams.add(interaction.options._hoistedOptions[0].value)

        await interaction.editReply({content: LUN.config.emotes.success +  "L'équipe a bien été ajoutée !", ephemeral: true})
    }
}