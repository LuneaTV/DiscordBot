const { AttachmentBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const Jimp = require("jimp");
const axios = require("axios");
const fs = require("fs");

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('match-details')
        .setType(ApplicationCommandType.Message),
    async button(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        const matchId = interaction.customId.split("_")[1]
        const won = interaction.customId.split("_")[2]
        LUN.db.logs(3, "Bouton - Match", `Génération du détails du match (${matchId})`)

        if (fs.existsSync(`assets/matchDetails/${matchId}-details.png`)) {
            try {
                const file = new AttachmentBuilder(`assets/matchDetails/${matchId}-details.png`)

                await interaction.editReply({
                    files: [file]
                })

                return
            } catch (e) {
                LUN.db.logs(1, "Bouton - Match", e)
            }
        }

        const matchDetails = await LUN.valorant.getMatch(matchId);

        let allyTeam = undefined
        let enemyTeam = undefined

        const baseImg = await axios.get('https://valorant-api.com/v1/maps/' + matchDetails.metadata.map.id).then(resp => {
            return resp.data
        }).catch((err) => {
            throw err;
        })

        const base = await Jimp.read(baseImg.data.splash);
        const matchDate = await LUN.utils.formatDate(new Date(matchDetails.metadata.started_at))
        const bannerPos = {
            1 : 80,
            2 : 280,
            3 : 480,
            4 : 680,
            5 : 880
        }

        let [bannerX, agentX, playerCount, playerCountAlly, playerCountEnemy] = [0,0,1,1,1]


        matchDetails.teams.forEach((team) => {
            if (won && team.won || !won && !team.won) {
                allyTeam = team
            } else {
                enemyTeam = team
            }
        })

        const scoreFont = await Jimp.loadFont("assets/fonts/Space Ranger/Default/Purple/100.fnt");
        const kdaFont = await Jimp.loadFont("assets/fonts/Space Ranger/Default/Purple/20.fnt");
        const kdaNbrFont = await Jimp.loadFont("assets/fonts/Space Ranger/Default/White/20.fnt");
        const playerFont = await Jimp.loadFont("assets/fonts/Dubai/White/30.fnt");
        const dateFont = await Jimp.loadFont("assets/fonts/Dubai/White/20.fnt");

        const allyScore = String(allyTeam.rounds.won)
        const enemyScore = String(enemyTeam.rounds.won)

        const separatorSize = Jimp.measureText(scoreFont, "-");
        const allyScoreSize = Jimp.measureText(scoreFont, allyScore);
        const separatorHeight = Jimp.measureTextHeight(scoreFont, "-", separatorSize);
        const allyScoreHeight = Jimp.measureTextHeight(scoreFont, "-", separatorSize);

        base.resize(1920,1080)
        base.blur(10);

        base.print(scoreFont, (base.getWidth() / 2)-(separatorSize/2), bannerPos[3]+60-(separatorHeight/2), "-")
        base.print(scoreFont, ((base.getWidth() / 2) - (allyScoreSize)) - 50, bannerPos[3]+60-(allyScoreHeight/2), allyScore)
        base.print(scoreFont, (base.getWidth() / 2) + 50, bannerPos[3]+60-(allyScoreHeight/2), enemyScore)

        const dateSize = Jimp.measureText(dateFont, matchDate);
        base.print(dateFont, (base.getWidth() / 2)-(dateSize/2), base.getHeight()-30, matchDate)

        for (const player of matchDetails.players) {
            const kSize = Jimp.measureText(kdaFont, `k`);
            const dSize = Jimp.measureText(kdaFont, `d`);
            const aSize = Jimp.measureText(kdaFont, `a`);

            const dSizeY = Jimp.measureTextHeight(kdaFont, `d`, dSize);
            const aSizeY = Jimp.measureTextHeight(kdaFont, `a`, aSize);

            const killsSize = Jimp.measureText(kdaNbrFont, `${player.stats.kills}`);
            const deathsSize = Jimp.measureText(kdaNbrFont, `${player.stats.deaths}`);
            const assistsSize = Jimp.measureText(kdaNbrFont, `${player.stats.assists}`);

            const deathsSizeY = Jimp.measureTextHeight(kdaNbrFont, `${player.stats.deaths}`, deathsSize);
            const assistsSizeY = Jimp.measureTextHeight(kdaNbrFont, `${player.stats.assists}`, assistsSize);

            if (player.team_id === allyTeam.team_id) {
                bannerX = -774
                agentX = -300
                playerCount = playerCountAlly

                base.print(kdaFont, (base.getWidth() / 2)-777-kSize, bannerPos[playerCount]+15, `k`)
                base.print(kdaFont, (base.getWidth() / 2)-777-dSize, bannerPos[playerCount]-(dSizeY / 2)+60, `d`)
                base.print(kdaFont, (base.getWidth() / 2)-777-aSize, bannerPos[playerCount]+120-(aSizeY)-15, `a`)

                base.print(kdaNbrFont, (base.getWidth() / 2)-777-kSize-killsSize-6, bannerPos[playerCount]+15, player.stats.kills)
                base.print(kdaNbrFont, (base.getWidth() / 2)-777-dSize-deathsSize-6, bannerPos[playerCount]-(deathsSizeY / 2)+60, player.stats.deaths)
                base.print(kdaNbrFont, (base.getWidth() / 2)-777-aSize-assistsSize-6, bannerPos[playerCount]+120-(assistsSizeY)-15, player.stats.assists)

                playerCountAlly++
            } else {
                bannerX = 350
                agentX = 200
                playerCount = playerCountEnemy

                base.print(kdaFont, (base.getWidth() / 2)+777, bannerPos[playerCount]+15, `k`)
                base.print(kdaFont, (base.getWidth() / 2)+777, bannerPos[playerCount]-(dSizeY / 2)+60, `d`)
                base.print(kdaFont, (base.getWidth() / 2)+777, bannerPos[playerCount]+120-(aSizeY)-15, `a`)

                base.print(kdaNbrFont, (base.getWidth() / 2)+777+kSize+6, bannerPos[playerCount]+15, player.stats.kills)
                base.print(kdaNbrFont, (base.getWidth() / 2)+777+dSize+6, bannerPos[playerCount]-(deathsSizeY / 2)+60, player.stats.deaths)
                base.print(kdaNbrFont, (base.getWidth() / 2)+777+aSize+6, bannerPos[playerCount]+120-(assistsSizeY)-15, player.stats.assists)

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
            await base.write(`assets/matchDetails/${matchId}-details.png`)
        } catch (err) {
            LUN.moderation("Impossible d'enregistrer l'image",
                "Impossible d'enregistrer le match " + matchId,
                false,
                2)
            throw LUN.db.logs(1, "Automatique - Match (Ecriture de l'image)", err)
        }

        setTimeout(async function () {
            try {
                const file = new AttachmentBuilder(`assets/matchDetails/${matchId}-details.png`)

                await interaction.editReply({
                    files: [file]
                })
            } catch (e) {
                LUN.db.logs(1, "Bouton - Match", e)
            }
        }, 1000)
    }
}