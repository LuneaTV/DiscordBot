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
        if (interaction.guild.id !== Lacy.config.guildID) return;
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        Lacy.logger.log("info", "Bouton - Match", `Génération du match`)

        const matchId = interaction.customId.split("_")[1]
        const winnerId = interaction.customId.split("_")[2]
        const loserId = interaction.customId.split("_")[3]
        const hasWonSeries = interaction.customId.split("_")[4]
        const subtitle = interaction.fields.getTextInputValue('subtitle')
        const text = interaction.fields.getTextInputValue('extraText')

        const winnerTeam = (await Lacy.db.teams.getByID(winnerId))[0]
        const loserTeam = (await Lacy.db.teams.getByID(loserId))[0]

        const bannerPos = {
            1 : 120,
            2 : 310,
            3 : 510,
            4 : 710,
            5 : 910
        }

        let [bannerX, agentX, playerCount, playerCountAlly, playerCountEnemy] = [0,0,1,1,1]

        const matchDetails = await Lacy.valorant.getMatch(matchId);

        let leftTeam = undefined
        let rightTeam = undefined

        const baseImg = await axios.get('https://valorant-api.com/v1/maps/' + matchDetails.metadata.map.id).then(resp => {
            return resp.data
        }).catch((err) => {
            throw err;
        })

        const base = await Jimp.read(baseImg.data.splash);

        matchDetails.teams.forEach((team) => {
            if (team.won) {
                leftTeam = team
            } else {
                rightTeam = team
            }
        })

        await Lacy.db.teams.update(winnerTeam.id,
            hasWonSeries === "none" ? winnerTeam.gw : hasWonSeries === "true" ? winnerTeam.gw+1 : winnerTeam.gw,
            hasWonSeries === "none" ? winnerTeam.gl : hasWonSeries === "false" ? winnerTeam.gl+1 : winnerTeam.gl,
            winnerTeam.mw+1, winnerTeam.ml,
            winnerTeam.rw + leftTeam.rounds.won, winnerTeam.rl + leftTeam.rounds.lost,
        )

        await Lacy.db.teams.update(loserTeam.id,
            hasWonSeries === "none" ? loserTeam.gw : hasWonSeries === "false" ? loserTeam.gw+1 : loserTeam.gw,
            hasWonSeries === "none" ? loserTeam.gl : hasWonSeries === "true" ? loserTeam.gl+1 : loserTeam.gl,
            loserTeam.mw, loserTeam.ml+1,
            loserTeam.rw + rightTeam.rounds.won, loserTeam.rl + rightTeam.rounds.lost,
        )

        const scoreFont = await Jimp.loadFont("assets/fonts/Space Ranger/Default/Cutie/100.fnt");
        const playerFont = await Jimp.loadFont("assets/fonts/Dubai/Regular/White/30.fnt");
        const teamFont = await Jimp.loadFont("assets/fonts/Baiti/Cutie/80.fnt");
        const subtitleFont = await Jimp.loadFont("assets/fonts/Dubai/Regular/White/20.fnt");

        const allyScore = String(leftTeam.rounds.won)
        const enemyScore = String(rightTeam.rounds.won)

        const separatorSize = Jimp.measureText(scoreFont, "-");
        const allyScoreSize = Jimp.measureText(scoreFont, allyScore);
        const separatorHeight = Jimp.measureTextHeight(scoreFont, "-", separatorSize);
        const allyScoreHeight = Jimp.measureTextHeight(scoreFont, "-", separatorSize);

        base.resize(1920,1080)
        base.blur(10);

        base.print(scoreFont, (base.getWidth() / 2)-(separatorSize/2), bannerPos[3]+60-(separatorHeight/2), "-")
        base.print(scoreFont, ((base.getWidth() / 2) - (allyScoreSize)) - 50, bannerPos[3]+60-(allyScoreHeight/2), allyScore)
        base.print(scoreFont, (base.getWidth() / 2) + 50, bannerPos[3]+60-(allyScoreHeight/2), enemyScore)

        const leftTeamSize = Jimp.measureText(teamFont, winnerTeam.name);
        const rightTeamSize = Jimp.measureText(teamFont, loserTeam.name);

        base.print(teamFont, ((base.getWidth() / 2) - (leftTeamSize / 2)) - 562, 15, winnerTeam.name)
        base.print(teamFont, ((base.getWidth() / 2) - (rightTeamSize / 2)) + 562, 15, loserTeam.name)

        const subtitleSize = Jimp.measureText(subtitleFont, subtitle);
        base.print(subtitleFont, (base.getWidth() / 2)-(subtitleSize/2), base.getHeight()-30, subtitle)

        for (const player of matchDetails.players) {
            if (player.team_id === leftTeam.team_id) {
                bannerX = -774
                agentX = -300
                playerCount = playerCountAlly

                playerCountAlly++
            } else {
                bannerX = 350
                agentX = 200
                playerCount = playerCountEnemy

                playerCountEnemy++
            }

            const banner = await Jimp.read(`https://media.valorant-api.com/playercards/${player.customization.card}/wideart.png`);
            const agent = await Jimp.read(`https://media.valorant-api.com/agents/${player.agent.id}/displayicon.png`);
            const nameSize = Jimp.measureText(playerFont, player.name);


            banner.resize(424,120)
            agent.resize(100,100);

            base.print(playerFont, ((base.getWidth() / 2) - (nameSize / 2))+bannerX+212, bannerPos[playerCount]+120, player.name)

            base.composite(agent, (base.getWidth() / 2)+agentX, bannerPos[playerCount]+10)
            base.composite(banner, (base.getWidth() / 2)+bannerX, bannerPos[playerCount])
        }

        try {
            await base.write(`assets/tmp/${matchId}.png`)
        } catch (err) {
            Lacy.moderation("Impossible d'enregistrer l'image",
                "Impossible d'enregistrer le match " + matchId,
                false,
                2)
            throw Lacy.logger.log("error", "Automatique - Match (Ecriture de l'image)", err)
        }

        setTimeout(async function () {
            const file = new AttachmentBuilder(`assets/tmp/${matchDetails.metadata.match_id}.png`)
            const channel = await Lacy.guild.channels.cache.get(Lacy.config.resultChannelID)

            if (text) {
                channel.send({
                    content: text,
                    files: [file],
                })
            } else {
                channel.send({
                    files: [file],
                })
            }

            await interaction.editReply({ content: Lacy.lang.emotes.success + "Le message a bien été envoyé", ephemeral: true })
            Lacy.utils.updateBrackets()
        }, 1000)
    }
}