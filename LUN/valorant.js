const axios = require("axios");

module.exports = {
    async getVal(url) {
        return await axios.get(url, { headers: {"Authorization": LUN.pass.Val_ApiKey}}).then(resp => {
            return resp.data
        }).catch((err) => {
            throw err;
        })
    },
    async getProfileByName(name) {
        try {
            if (name.split("#").length !== 2 ) throw 404
            return (await this.getVal(`https://api.henrikdev.xyz/valorant/v1/account/${name.split("#")[0]}/${name.split("#")[1]}`)).data
        } catch (err) {
            if (err.response !== undefined && err.response.status === 404) throw 404
            LUN.db.logs(1, "getProfileByName (Valorant) - Name: " + name, err)
            throw 0
        }
    },
    async getProfileByPuuid(puuid) {
        try {
            return await this.getVal(`https://api.henrikdev.xyz/valorant/v1/by-puuid/account/${puuid}`)
        } catch (err) {
            if (err.response !== undefined && err.response.status === 404) throw 404
            LUN.db.logs(1, "getProfileByPuuid (Valorant) - PUUID: " + puuid, err)
            throw 0
        }
    },
    async getRank(puuid) {
        try {
            return (await this.getVal(`https://api.henrikdev.xyz/valorant/v3/by-puuid/mmr/eu/pc/${puuid}`)).data
        } catch (err) {
            LUN.db.logs(1, "getRank (Valorant) - PUUID: " + puuid, err)
            throw err
        }
    },
    async lastMatches(puuid) {
        try {
            return (await this.getVal(`https://api.henrikdev.xyz/valorant/v4/by-puuid/matches/eu/pc/${puuid}?mode=competitive&size=4`)).data
        } catch (err) {
            LUN.db.logs(1, "lastMatches (Valorant) - PUUID: " + puuid, err)
            throw err
        }
    },
    async lastCustomGame(puuid) {
        try {
            return (await this.getVal(`https://api.henrikdev.xyz/valorant/v4/by-puuid/matches/eu/pc/${puuid}?mode=custom&size=1`)).data
        } catch (err) {
            LUN.db.logs(1, "lastCustomGame (Valorant) - PUUID: " + puuid, err)
            throw err
        }
    },
    async getPremierTeam(teamPuuid) {
        try {
            return (await this.getVal(`https://api.henrikdev.xyz/valorant/v1/premier/${teamPuuid}`)).data
        } catch (err) {
            LUN.db.logs(1, "getPremierTeam (Valorant) - teamPuuid: " + teamPuuid, err)
            throw err
        }
    },
    async lastPremierMatches(teamPuuid) {
        try {
            return (await this.getVal(`https://api.henrikdev.xyz/valorant/v1/premier/${teamPuuid}/history`)).data
        } catch (err) {
            LUN.db.logs(1, "lastPremierMatches (Valorant) - teamPuuid: " + teamPuuid, err)
            throw err
        }
    },
    async getMatch(matchId) {
        try {
            return (await this.getVal(`https://api.henrikdev.xyz/valorant/v4/match/eu/${matchId}`)).data
        } catch (err) {
            LUN.db.logs(1, "lastMatches (Valorant) - matchId): " + matchId, err)
            throw err
        }
    },
}