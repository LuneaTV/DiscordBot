const { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle, ActionRowBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('val_management')
        .setDescription('Ajouter, modifier et supprimer des profils Valorant')
        .setDefaultMemberPermissions(PermissionFlagsBits.MoveMembers)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Recruter un joueur')
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription('Mentionnez à quel membre appartient ce compte Valorant')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('valorant')
                        .setDescription('Donnez le nom de son compte Valorant')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('pronom')
                        .setDescription('Comment genrer ?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Il', value: 'il' },
                            { name: 'Iel', value: 'iel' },
                            { name: 'Elle', value: 'elle' },
                        ))
                .addStringOption(option =>
                    option.setName('roleig')
                        .setDescription('Le nom de son rôle IG')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Controlleur', value: 'Controlleu' },
                            { name: 'Initiateur', value: 'Initia' },
                            { name: 'Duelliste', value: 'Duellist' },
                            { name: 'Sentinelle', value: 'Sentinel' },
                            { name: 'Flex', value: 'Flex' },
                            { name: 'Aucun', value: 'empty' },
                        ))
                .addStringOption(option =>
                    option.setName('role')
                        .setDescription('Le nom de son rôle dans le roster')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Joueur', value: 'Joueu' },
                            { name: 'Remplaçant', value: 'Remplaçant' },
                            { name: 'Coach', value: 'Coach' },
                            { name: 'Assistant Coach', value: 'Assistant Coach' },
                        ))
                .addStringOption(option =>
                    option.setName('roster')
                        .setDescription('Donnez le nom du roster')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Noxelia', value: 'Noxelia' },
                            { name: 'Masculin', value: 'Masculin' },
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('valorant')
                .setDescription('Changer le compte valorant')
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription('Mentionnez quel profil vous souhaitez modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('valorant')
                        .setDescription('Donnez le nom de son nouveau compte Valorant')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('role')
                .setDescription('Changer le rôle')
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription('Mentionnez quel profil vous souhaitez modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('pronom')
                        .setDescription('Comment genrer ?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Il', value: 'il' },
                            { name: 'Iel', value: 'iel' },
                            { name: 'Elle', value: 'elle' },
                        ))
                .addStringOption(option =>
                    option.setName('role')
                        .setDescription('Donnez le rôle')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Joueur', value: 'Joueu' },
                            { name: 'Remplaçant', value: 'Remplaçant' },
                            { name: 'Coach', value: 'Coach' },
                            { name: 'Assistant Coach', value: 'Assistant Coach' },
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('role_ig')
                .setDescription('Changer le rôle IG')
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription('Mentionnez quel profil vous souhaitez modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('pronom')
                        .setDescription('Comment genrer ?')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Il', value: 'il' },
                            { name: 'Iel', value: 'iel' },
                            { name: 'Elle', value: 'elle' },
                        ))
                .addStringOption(option =>
                    option.setName('role_ig')
                        .setDescription('Changer le rôle IG')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Controlleur', value: 'Controlleu' },
                            { name: 'Initiateur', value: 'Initia' },
                            { name: 'Duelliste', value: 'Duellist' },
                            { name: 'Sentinelle', value: 'Sentinel' },
                            { name: 'Flex', value: 'Flex' },
                            { name: 'Aucun', value: 'empty' },
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('roster')
                .setDescription('Changer le roster')
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription('Mentionnez quel profil vous souhaitez modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('roster')
                        .setDescription('Donnez le nom du roster')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Noxelia', value: 'Noxelia' },
                            { name: 'Masculin', value: 'Masculin' },
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('name')
                .setDescription("Modifier le nom d'un profil")
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription('Mentionnez quel profil vous souhaitez modifier')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Donnez le nom que vous souhaitez donner')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Virer un membre')
                .addMentionableOption(option =>
                    option.setName('membre')
                        .setDescription('Mentionnez le membre à renvoyer')
                        .setRequired(true))),
    async execute(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;

        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        switch (interaction.options._subcommand) {
            case "refus":
                this.refus(interaction)
                break;
            case "add":
                this.add(interaction);
                break;
            case "valorant":
                this.valId(interaction);
                break;
            case "pronom":
                this.pronom(interaction);
                break;
            case "roster":
                this.roster(interaction);
                break;
            case "role":
                this.role(interaction);
                break;
            case "role_ig":
                this.role_ig(interaction);
                break;
            case "name":
                this.name(interaction);
                break;
            case "remove":
                this.remove(interaction)
                break;
        }
    },
    async add(interaction) {
        let hasAccess = false
        LUN.config.allowList.addPlayer.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({
            content: LUN.config.emotes.error + LUN.lang.error.noPerm,
            ephemeral: true
        })

        let val_acc;
        let profile;
        let ranking;

        const discord = interaction.options._hoistedOptions[0]
        const name = await LUN.utils.getName(discord.member)

        let endMessage = " Le profil a bien été ajouté !"

        val_acc = interaction.options._hoistedOptions[1].value
        if ((await LUN.db.valorant.get(discord.value)).length !== 0) return interaction.editReply({
            content: LUN.config.emotes.error + LUN.lang.commands.valadm.alreadyExist,
            ephemeral: true
        })


        try {
            profile = await LUN.valorant.getProfileByName(val_acc)
        } catch (e) {
            if (e === 404) return interaction.editReply({
                content: LUN.config.emotes.error + " Le compte est introuvable",
                ephemeral: true
            })
            const LogID = await LUN.db.logs(1, "Commande - Val_Management (Add - getProfileByName)", e)
            return interaction.editReply({ content: LUN.config.emotes.error + LUN.lang.error.unknow + LogID, ephemeral: true });
        }

        try {
            ranking = await LUN.valorant.getRank(profile.puuid)
        } catch (e) {
            const LogID = await LUN.db.logs(1, "Commande - Val_Management (Add - GetRank)", e)
            return interaction.editReply({ content: LUN.config.emotes.error + LUN.lang.error.unknow + LogID, ephemeral: true });
        }

        let genre = interaction.options._hoistedOptions[2].value
        let role_ig = interaction.options._hoistedOptions[3].value
        let role = interaction.options._hoistedOptions[4].value

        switch (role_ig) {
            case "Controlleu":
                role_ig = role_ig + (genre === "il" ? "r" : (genre === "iel" ? "r.euse" : "se"))
                break;
            case "Initia":
                role_ig = role_ig + (genre === "il" ? "teur" : (genre === "iel" ? "teur.trice" : "trice"))
                break;
            case "Duellist":
                role_ig = role_ig + (genre === "il" ? "" : (genre === "iel" ? ".e" : "e"))
                break;
            case "Sentinel":
                role_ig = role_ig + (genre === "il" ? "" : (genre === "iel" ? ".le" : "le"))
                break;
        }

        switch (role) {
            case "Joueu":
                role = role + (genre === "il" ? "r" : (genre === "iel" ? "r.euse" : "se"))
                break;
            case "Remplaçant":
                role = role + (genre === "il" ? "" : (genre === "iel" ? ".e" : "e"))
                break;
        }

        await LUN.db.valorant.create(discord.value, discord.user.avatar, name, profile, ranking, role_ig, role, interaction.options._hoistedOptions[5].value)

        await interaction.editReply({content: LUN.config.emotes.success + endMessage, ephemeral: true})
    },
    async valId(interaction) {
        let hasAccess = false
        LUN.config.allowList.modifyPlayer.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true})

        const discord = interaction.options._hoistedOptions[0]
        let val_acc;
        let profile;
        let ranking;

        val_acc = interaction.options._hoistedOptions[1].value
        if ((await LUN.db.valorant.get(discord.value)).length === 0) return interaction.editReply({
            content: LUN.config.emotes.error + LUN.lang.commands.valadm.unknowAccount,
            ephemeral: true
        })


        try {
            profile = await LUN.valorant.getProfileByName(val_acc)
        } catch (e) {
            if (e === 404) return interaction.editReply({
                content: LUN.config.emotes.error + " Le compte est introuvable",
                ephemeral: true
            })
            const LogID = await LUN.db.logs(1, "Commande - Val_Management (valId - GetProfile)", e)
            return interaction.editReply({ content: LUN.config.emotes.error + LUN.lang.error.unknow + LogID, ephemeral: true });
        }

        try {
            ranking = await LUN.valorant.getRank(profile.puuid)
        } catch (e) {
            const LogID = await LUN.db.logs(1, "Commande - Val_Management (valId - GetRank)", e)
            return interaction.editReply({ content: LUN.config.emotes.error + LUN.lang.error.unknow + LogID, ephemeral: true });
        }

        await LUN.db.valorant.edit(discord.value, profile, ranking)
        await interaction.editReply({content: LUN.config.emotes.success + " Le compte valorant a bien été modifié !", ephemeral: true})
    },
    async role(interaction) {
        let hasAccess = false
        LUN.config.allowList.modifyPlayer.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true})

        let genre = interaction.options._hoistedOptions[1].value
        let role = interaction.options._hoistedOptions[2].value

        switch (role) {
            case "Joueu":
                role = role + (genre === "il" ? "r" : (genre === "iel" ? "r.euse" : "se"))
                break;
            case "Remplaçant":
                role = role + (genre === "il" ? "" : (genre === "iel" ? ".e" : "e"))
                break;
        }

        await LUN.db.valorant.role(interaction.options._hoistedOptions[0].value, role)
        await interaction.editReply({content: LUN.config.emotes.success + " Le rôle a bien été modifié !", ephemeral: true})
    },
    async role_ig(interaction) {
        let hasAccess = false
        LUN.config.allowList.modifyPlayer.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true})


        let genre = interaction.options._hoistedOptions[1].value
        let role_ig = interaction.options._hoistedOptions[2].value

        switch (role_ig) {
            case "Controlleu":
                role_ig = role_ig + (genre === "il" ? "r" : (genre === "iel" ? "r.euse" : "se"))
                break;
            case "Initia":
                role_ig = role_ig + (genre === "il" ? "teur" : (genre === "iel" ? "teur.trice" : "trice"))
                break;
            case "Duellist":
                role_ig = role_ig + (genre === "il" ? "" : (genre === "iel" ? ".e" : "e"))
                break;
            case "Sentinel":
                role_ig = role_ig + (genre === "il" ? "" : (genre === "iel" ? ".le" : "le"))
                break;
        }

        await LUN.db.valorant.role_ig(interaction.options._hoistedOptions[0].value, role_ig)
        await interaction.editReply({content: LUN.config.emotes.success + " Le rôle IG a bien été modifié !", ephemeral: true})
    },
    async roster(interaction) {
        let hasAccess = false
        LUN.config.allowList.modifyPlayer.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true})

        await LUN.db.valorant.roster(interaction.options._hoistedOptions[0].value, interaction.options._hoistedOptions[1].value)
        await interaction.editReply({content: LUN.config.emotes.success + " Le nom a bien été modifié !", ephemeral: true})
    },
    async name(interaction) {
        let hasAccess = false
        LUN.config.allowList.modifyPlayer.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true})

        await LUN.db.valorant.name(interaction.options._hoistedOptions[0].value, interaction.options._hoistedOptions[1].value)
        await interaction.editReply({content: LUN.config.emotes.success + " Le nom a bien été modifié !", ephemeral: true})
    },
    async remove(interaction) {
        let hasAccess = false
        LUN.config.allowList.removePlayer.forEach(function (roleID) {
            if (interaction.member.roles.cache.has(roleID)) {
                hasAccess = true
            }
        });
        if (!hasAccess) return interaction.editReply({content: LUN.config.emotes.error + LUN.lang.error.noPerm, ephemeral: true})

        const discord = interaction.options._hoistedOptions[0]

        profile = await LUN.db.valorant.get(discord.value)
        if (profile.length === 0) return interaction.editReply({content: LUN.config.emotes.error + " Le profil n'existe pas", ephemeral: true})

        let endMessage = " Le joueur a été retiré de l'équipe !"

        await LUN.db.valorant.remove(discord.value)

        await interaction.editReply({content: LUN.config.emotes.success + endMessage, ephemeral: true})
    }
}