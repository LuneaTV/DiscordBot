const { AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
const Jimp = require("jimp");
const axios = require("axios");
const fs = require("fs");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('send-custom-modal')
        .setType(ApplicationCommandType.Message),
    async modal(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        const matchId = interaction.customId.split("_")[1]
        const won = (interaction.customId.split("_")[2] === 'true')
        const roster = interaction.fields.getTextInputValue('allyName')
        const enemy = interaction.fields.getTextInputValue('enemyName')
        const tournament = interaction.fields.getTextInputValue('tournamentName')
        const extraText = interaction.fields.getTextInputValue('extraText')

        LUN.db.logs(3, "Bouton - Match", `Génération du match (${matchId})`)

        const matchDetails = await LUN.valorant.getMatch(matchId);

        let allyTeam = undefined
        let enemyTeam = undefined

        matchDetails.teams.forEach((team) => {
            if ((won && team.won) || (!won && !team.won)) {
                allyTeam = team
            } else {
                enemyTeam = team
            }
        })

        const baseImg = await axios.get('https://valorant-api.com/v1/maps/' + matchDetails.metadata.map.id).then(resp => {
            return resp.data
        }).catch((err) => {
            throw err;
        })

        const base = await Jimp.read(baseImg.data.splash);

        const titleFont = await Jimp.loadFont(`assets/fonts/VALORANT/${won ? "Green" : "Red"}/150.fnt`);
        const scoreFont = await Jimp.loadFont("assets/fonts/Space Ranger/Default/Purple/130.fnt");
        const playerFont = await Jimp.loadFont("assets/fonts/Dubai/White/30.fnt");

        const allyScore = String(allyTeam.rounds.won)
        const enemyScore = String(enemyTeam.rounds.won)

        const titleSize = Jimp.measureText(titleFont, won ? LUN.lang.messages.premier.title.victoire : LUN.lang.messages.premier.title.defaite);

        const separatorSize = Jimp.measureText(scoreFont, "-");
        const allyScoreSize = Jimp.measureText(scoreFont, allyScore);

        base.resize(1920,1080)
        base.blur(10);

        const bannerPos = {
            1 : 0,
            2 : 350,
            3 : -350,
            4 : 700,
            5 : -700
        }

        let playerCount = 0;
        for (const player of matchDetails.players) {
            if (player.team_id === allyTeam.team_id) {
                playerCount++;
                const banner = await Jimp.read(`https://media.valorant-api.com/playercards/${player.customization.card}/largeart.png`);
                const agent = await Jimp.read(`https://media.valorant-api.com/agents/${player.agent.id}/displayicon.png`);
                const nameSize = Jimp.measureText(playerFont, player.name);

                banner.resize(209, 500)
                agent.resize(100,100);

                base.print(playerFont, ((base.getWidth() / 2) - (nameSize / 2))+bannerPos[playerCount], 780, player.name)
                base.composite(banner, ((base.getWidth() / 2) - (banner.getWidth() / 2))+bannerPos[playerCount], 275)
                //base.composite(agent, ((base.getWidth() / 2) - (banner.getWidth() / 2))+bannerPos[playerCount]+54.5, 675)
            }
        }

        base.print(titleFont, (base.getWidth() / 2) - (titleSize / 2), 50, won ? LUN.lang.messages.premier.title.victoire : LUN.lang.messages.premier.title.defaite)

        base.print(scoreFont, ((base.getWidth() / 2) - (separatorSize / 2)), (base.getHeight()-180), "-")
        base.print(scoreFont, ((base.getWidth() / 2) - (allyScoreSize)) - 50, (base.getHeight()-180), allyScore)
        base.print(scoreFont, (base.getWidth() / 2) + 50, (base.getHeight()-180), enemyScore)

        try {
            await base.write(`assets/tmp/${matchDetails.metadata.match_id}.png`)
        } catch (err) {
            LUN.moderation("Impossible d'enregistrer l'image",
                "Impossible d'enregistrer le match " + matchDetails.metadata.match_id,
                false,
                2)
            throw LUN.db.logs(1, "Automatique - Match (Ecriture de l'image)", err)
        }

        let row = new ActionRowBuilder()

        const premierDetails = new ButtonBuilder()
            .setCustomId(`match-details_${matchDetails.metadata.match_id}_${won}`)
            .setLabel('Voir le détail du match')
            .setStyle(ButtonStyle.Primary);
        row.addComponents(premierDetails);

        let message = ""

        if (tournament === "" || tournament === undefined) {
            // Pas un tournoi
            message = (won ? LUN.lang.messages.matchAnnounceMessage.normal.victoire : LUN.lang.messages.matchAnnounceMessage.normal.defaite).replace("%p", `<@&${LUN.config.roles.resultMatch}>`).replace("%r", roster).replace("%e", enemy).replace("%m", matchDetails.metadata.map.name)
        } else {
            // Un tournoi
            message = (won ? LUN.lang.messages.matchAnnounceMessage.tournament.victoire : LUN.lang.messages.matchAnnounceMessage.tournament.defaite).replace("%p", `<@&${LUN.config.roles.resultMatch}>`).replace("%r", roster).replace("%e", enemy).replace("%m", matchDetails.metadata.map.name).replace("%t", tournament)
        }

        if (extraText !== "" && extraText !== undefined) {
            message += "\n\n" + extraText + " "
        }

        setTimeout(async function () {
            const file = new AttachmentBuilder(`assets/tmp/${matchDetails.metadata.match_id}.png`)
            const channel = await LUN.guild.channels.cache.get(LUN.config.channel.matchAnnounce)

            channel.send({
                content: message + LUN.config.emotes.logo,
                files: [file],
                components: [row]
            })

            await interaction.editReply({ content: LUN.config.emotes.success + "Le message a bien été envoyé", ephemeral: true })
        }, 1000)
    }
}