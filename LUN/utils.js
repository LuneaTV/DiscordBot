const fs = require("fs");
const axios = require("axios");
const { REST, Routes, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require('discord.js');
const Jimp = require("jimp");

module.exports = {
    async getVal(url) {
        return await axios.get(url, { headers: {"Authorization": LUN.pass.Val_ApiKey}}).then(resp => {
            return resp.data.data
        }).catch((err) => {
            LUN.db.logs(1, "GetVal (Val API)", err)
            if (err.response.status === 404) return true;
            return false;
        })
    },
    capitalizeFirstLetter(string) {
        string = string.toLowerCase()
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    formatMinutes(date) {
        let minutes = date.getMinutes()
        if (date.getMinutes() < 10) {
            minutes = "0" + date.getMinutes()
        }

        return minutes;
    },
    async formatDate(date) {
        let hour = date.getHours()
        if (date.getHours() < 10) {
            hour = "0" + date.getHours()
        }

        let minutes = date.getMinutes()
        if (date.getMinutes() < 10) {
            minutes = "0" + date.getMinutes()
        }

        let day = date.getDate()
        if (date.getDate() < 10) {
            day = "0" + date.getDate()
        }

        let month = date.getMonth()+1
        if (date.getMonth()+1 < 10) {
            month = "0" + date.getMonth()+1
        }

        return `${day}/${month}/${date.getFullYear()} - ${hour}:${minutes}`
    },
    async registerCommands() {
        const commandsList = []
        LUN.commands = []

        fs.readdirSync(__basedir + '/interactions').forEach(typeDir => {
            fs.readdirSync(__basedir + '/interactions/' + typeDir).forEach(dir => {
                fs.readdirSync( __basedir + `/interactions/${typeDir}/${dir}`).filter(file => file.endsWith('.js')).forEach(file => {
                    const command = require(__basedir + `/interactions/${typeDir}/${dir}/${file}`);

                    if ('data' in command) {
                        let commandData = command.data.toJSON()
                        LUN.db.logs(3, "Commandes", `Ajout de l'interaction de type ${typeDir}, du nom de ${commandData.name} présente dans le dossier ${dir}`)

                        LUN.commands[commandData.name] = {"dir": dir, "cmd": command}

                        if ('execute' in command) {
                            commandsList.push(commandData);
                        }
                    } else {
                        LUN.db.logs(2, "Commandes", `La commande de type ${typeDir} ${dir}/${file} n'a pas la propriété data.`)
                    }
                });
            });
        });

        const rest = new REST().setToken(LUN.pass.DiscordToken);

        await (async () => {
            try {
                LUN.db.logs(3, "Commandes", `Lancement de la réinitialisation de ${commandsList.length} commandes.`)

                // The put method is used to fully refresh all commands in the guild with the current set
                const data = await rest.put(
                    Routes.applicationGuildCommands(LUN.config.clientID, LUN.config.guildID),
                    {body: commandsList},
                );

                LUN.db.logs(3, "Commandes", `Réinitialisation de ${data.length} commandes effectués avec succès`)
            } catch (err) {
                // And of course, make sure you catch and log any errors!
                LUN.db.logs(1, "Commandes", err)
            }
        })();
    },
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    async updateVal(){
        let profiles = await LUN.db.valorant.getAllProfile()

        LUN.db.logs(3, "updateVal - Profile (Utils)", `Mise à jour des profils Valorant en cours`)

        for (const profile of profiles) {
            LUN.db.logs(3, "updateVal - Profile (Utils)", `Mise à jour du profil Valorant : ${profile.global_name}`)

            let acc
            try {
                acc = (await LUN.valorant.getProfileByPuuid(profile.gameId)).data
            } catch (err) {
                LUN.db.logs(1, "updateVal (Utils)", `Erreur avec le compte : ${profile.gameName}\n${err}`)
            }

            let ranking
            try {
                ranking = await LUN.valorant.getRank(profile.gameId)
                await LUN.db.valorant.edit(profile.id, acc, ranking)
            } catch (err) {
                LUN.db.logs(1, "updateVal - Ranking (Utils)", `Erreur avec le ranking du compte : ${profile.gameName}\n${err}`)
            }
        }

        this.updateValRoster()

        LUN.db.logs(3, "updateVal  (Utils)", `Mise à jour des profils Valorant terminée`)
    },
    async fetchPremierMatches() {
        LUN.db.logs(3, "fetchPremierMatches (Utils)", `Lancement de la rechercher Premier`)
        for (const [rosterId, roster] of Object.entries(LUN.config.premier)) {
            if (roster.teamId === "" || roster.teamId === undefined) continue;
            const lastMatches = await LUN.valorant.lastPremierMatches(roster.teamId)
            const premierTeam = await LUN.valorant.getPremierTeam(roster.teamId)
            const allMatches = lastMatches.league_matches.concat(lastMatches.tournament_matches);

            if (allMatches && allMatches.length === 0) continue;

            for (const premierMatch of allMatches) {
                const allMatchId = []
                if (premierMatch.id) {
                    allMatchId.push(premierMatch.id)
                } else {
                    allMatchId.push(premierMatch.matches)
                }

                for (const matchId of allMatchId) {
                    if (await LUN.db.valorant.premier.matchExists(matchId)) continue;

                    const matchDetails = await LUN.valorant.getMatch(matchId)
                    const won = (premierMatch.points_after - premierMatch.points_before) === 100

                    let allyTeam = undefined
                    let enemyTeam = undefined

                    if (!matchDetails) continue;

                    try {
                        LUN.db.valorant.premier.createMatch(rosterId, matchId, premierMatch.points_after)
                    } catch (e) {
                        throw LUN.db.logs(1, "Enregistrement du match Premier", e)
                    }

                    matchDetails.teams.forEach((team) => {
                        if (team.premier_roster.id === premierTeam.id) {
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
                    const allyIcon = await Jimp.read(allyTeam.premier_roster.customization.image.split("&tertiary")[0]);
                    const enemyIcon = await Jimp.read(enemyTeam.premier_roster.customization.image.split("&tertiary")[0]);
                    const premierIcon = await Jimp.read("assets/valorant/premier.png");
                    const progressFull = await Jimp.read("assets/progressFull.png");
                    const progressBg = await Jimp.read("assets/progressBg.png");

                    const titleFont = await Jimp.loadFont(`assets/fonts/VALORANT/${won ? "Green" : "Red"}/150.fnt`);
                    const scoreFont = await Jimp.loadFont("assets/fonts/Babapro/Purple/90.fnt");
                    const pointFont = await Jimp.loadFont("assets/fonts/Dubai/White/20.fnt");
                    const playerFont = await Jimp.loadFont("assets/fonts/Dubai/White/30.fnt");

                    const allyScore = String(allyTeam.rounds.won)
                    const enemyScore = String(enemyTeam.rounds.won)

                    const pointSize = Jimp.measureText(pointFont, premierMatch.points_after !== premierMatch.points_before ? premierMatch.points_after >= 600 ? "Qualifié" : `${premierMatch.points_after} / 600` : 'PlayOffs');
                    const titleSize = Jimp.measureText(titleFont, won ? LUN.lang.messages.premier.title.victoire : LUN.lang.messages.premier.title.defaite);
                    const scoreSize = Jimp.measureText(scoreFont, `${allyScore < 10 ? " " + allyScore : allyScore} - ${enemyScore < 10 ? " " + enemyScore : enemyScore}`);

                    allyIcon.resize(175,175)
                    enemyIcon.resize(175,175)
                    premierIcon.resize(100,100)

                    progressFull.resize(premierMatch.points_after >= 600 ? 300 : premierMatch.points_after/2, 6)
                    progressBg.resize(300, 6)

                    premierIcon.opacity(.4)

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
                            const nameSize = Jimp.measureText(playerFont, player.name);

                            banner.resize(209, 500)

                            base.print(playerFont, ((base.getWidth() / 2) - (nameSize / 2))+bannerPos[playerCount], 780, player.name)
                            base.composite(banner, ((base.getWidth() / 2) - (banner.getWidth() / 2))+bannerPos[playerCount], 275)
                        }
                    }

                    base.print(titleFont, (base.getWidth() / 2) - (titleSize / 2), 50, won ? LUN.lang.messages.premier.title.victoire : LUN.lang.messages.premier.title.defaite)

                    base.print(scoreFont, ((base.getWidth() / 2) - (scoreSize / 2)), (base.getHeight()-180), `${allyScore < 10 ? " " + allyScore : allyScore} - ${enemyScore < 10 ? " " + enemyScore : enemyScore}`)

                    base.print(pointFont, (base.getWidth() / 2) - (pointSize / 2),(base.getHeight()-40), premierMatch.points_after !== premierMatch.points_before ? premierMatch.points_after >= 600 ? "Qualifié" : `${premierMatch.points_after} / 600` : 'PlayOffs')



                    if (premierMatch.points_before !== premierMatch.points_after) {
                        base.composite(progressBg, (base.getWidth() / 2) - (progressBg.getWidth() / 2),(base.getHeight()-50))
                        base.composite(progressFull, (base.getWidth() / 2) - (progressBg.getWidth() / 2),(base.getHeight()-50))
                    }


                    base.composite(allyIcon, ((base.getWidth() / 2) - (allyIcon.getWidth() / 2))-350, (base.getHeight()-100) - (allyIcon.getHeight() / 2))
                    base.composite(enemyIcon, ((base.getWidth() / 2) - (enemyIcon.getWidth() / 2))+350, (base.getHeight()-100) - (enemyIcon.getHeight() / 2))

                    base.composite(premierIcon, base.getWidth()-premierIcon.getWidth()-20,20)

                    try {
                        await base.write(`assets/tmp/${matchId}.png`)
                    } catch (err) {
                        LUN.moderation("Impossible d'enregistrer l'image",
                            "Impossible d'enregistrer le match Premier " + matchId,
                            false,
                            2)
                        throw LUN.db.logs(1, "Automatique - Premier (Ecriture de l'image)", err)
                    }

                    let row = new ActionRowBuilder()

                    const premierDetails = new ButtonBuilder()
                        .setCustomId(`premier_${matchId}_${won}`)
                        .setLabel('Voir le détail du match')
                        .setStyle(ButtonStyle.Primary);
                    row.addComponents(premierDetails);


                    setTimeout(async function () {
                        const file = new AttachmentBuilder(`assets/tmp/${matchId}.png`)
                        const channel = await LUN.guild.channels.cache.get(LUN.config.channel.matchAnnounce)

                        channel.send({
                            content: (won ? LUN.lang.messages.matchAnnounceMessage.normal.victoire : LUN.lang.messages.matchAnnounceMessage.normal.defaite).replace("%p", `<@&${LUN.config.roles.resultMatch}>`).replace("%r", roster.name).replace("%e", enemyTeam.premier_roster.name).replace("%m", matchDetails.metadata.map.name) + LUN.config.emotes.logo,
                            files: [file],
                            components: [row]
                        })
                    }, 1000)
                }
            }
        }
    },
    async updateValRoster() {
        const channel = await LUN.guild.channels.cache.get(LUN.config.channel.val_roster);
        const profiles = await LUN.db.valorant.getProfileForRoster();

        let message = (await (channel.messages.fetch({ limit: 2 }))).first()
        let text = LUN.lang.messages.roster.val.title
        let rosters = {}

        for (const profile of profiles) {
            if (profile.role === "" || profile.roster === "" || profile.roster === "all" || profile.roster === "staff") continue;
            profile.roster = profile.roster.split('_')[0]

            if (rosters[profile.roster] === undefined) {
                rosters[profile.roster] = LUN.lang.messages.roster.val.rostertitle.replace("%n", this.capitalizeFirstLetter(profile.roster))
            }

            rosters[profile.roster] = rosters[profile.roster] + LUN.lang.messages.roster.val.line.replace("%r", LUN.config.emotes.rank[profile.rank]).replace("%c", profile.role).replace("%n", `<@${profile.id}>`)

            if (profile.role_ig !== "") {
                rosters[profile.roster] = rosters[profile.roster] + LUN.lang.messages.roster.val.role.replace("%r", profile.role_ig)
            }
        }

        if (rosters.length === 0) return;

        for (const roster in rosters) {
            text = text + rosters[roster]
        }

        text = text + LUN.lang.messages.roster.val.end

        if (message === undefined || message.author.id !== LUN.config.clientID) {
            if (message) {
                await channel.messages.fetch({
                    limit: 100
                }).then((messages) => {
                    messages.forEach(async (message) => {
                        LUN.db.logs(4, "Roster Val - Clear", "Supression d'un message de " + message.author + ", contenu : " + message.content)
                        LUN.bulkDeleted.push(message.id);
                        try {
                            await message.delete();
                        } catch (e) {
                            LUN.db.logs(1, "Roster Val - Clear", e)
                        }
                    })
                })
            }
            channel.send(text)
        } else {
            message.edit(text)
        }
    },
    async getDisplayName(member) {
        let name

        if (member.nickname === null) {
            if (member.user.globalName === null) name = member.user.username
            else name = member.user.globalName
        } else name = member.nickname

        return name;
    },
    async getName(member) {
        let name
        const val_acc = await LUN.db.valorant.get(member.id)

        if (val_acc.length !== 0) {
            name = val_acc[0].global_name
        } else {
            if (member.nickname === null) {
                if (member.user.globalName === null) name = member.user.username
                else name = member.user.globalName
            } else name = member.nickname
        }

        return name;
    },
}


Date.prototype.addMinutes = function(m){
    this.setMinutes(this.getMinutes()+m);
    return this;
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}