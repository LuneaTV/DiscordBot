module.exports = {
    async getLog(LogID) {
        try {
            const [rows] = await LUN.sql.execute("SELECT * FROM logs WHERE id=?", [LogID])
            return rows
        } catch (err) {
            LUN.logger.log("error",err)
            throw err;
        }
    },
    async logs(type, module, message) {
        /*
        1: Erreur
        2: Warn
        3: Info
        4: Modération
         */

        try {
            const sql = "INSERT INTO `logs` (type,module,messages) VALUES (?,?,?);"
            await LUN.sql.execute(sql, [type, module, String(message)], function (err, result) {
                if (err) throw err;

                let id = -1

                if (query && query.insertId) id = query.insertId

                switch (type) {
                    case 1:
                        LUN.logger.log("error", `${module} - ${messages} (LogID : ${id})`)
                        if (!LUN.dev) LUN.channels.errlog.send(`### ${module}\n ${messages} (LogID : ${id})`)
                        break;
                    case 2:
                        LUN.logger.log("warn", `${module} - ${messages} (LogID : ${id})`)
                        break;
                    case 3:
                        LUN.logger.log("info", `${module} - ${messages} (LogID : ${id})`)
                        break;
                    case 4:
                        LUN.logger.log("mod", `${module} - ${messages} (LogID : ${id})`)
                        break;
                }

                return id
            });
        } catch (err) {
            LUN.logger.log("error",err)
            throw err;
        }
    },
    valorant: {
        premier: {
            async matchExists(matchId) {
                try {
                    const [rows] = await LUN.sql.execute("SELECT * FROM premier WHERE matchId=?", [matchId])
                    return rows.length !== 0
                } catch (err) {
                    LUN.logger.log("error", err)
                    throw err;
                }
            },
            async createMatch(roster, matchId, score) {
                try {
                    const [rows] = await LUN.sql.execute("INSERT INTO premier (roster,matchId,score) VALUES (?,?,?)", [roster, matchId, score])
                    return rows
                } catch (err) {
                    LUN.logger.log("error", err)
                    throw err;
                }
            },
        },
        async getProfileForRoster() {
            try {
                const [rows] = await LUN.sql.execute("SELECT * FROM users WHERE roster != '' ORDER BY roster, role, rank DESC;")
                return rows
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async getName(id) {
            try {
                const [rows] = await LUN.sql.execute("SELECT * FROM users WHERE id=?", [id])
                return rows
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async getAllProfile() {
            try {
                const [rows] = await LUN.sql.execute("SELECT * FROM users")
                return rows
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async create(discord, avatar, name, profile, ranking, role_ig, role) {
            const [rows] = await LUN.sql.execute("INSERT INTO \`users\` (id,avatar,global_name,gameId,gameName,rank,points,role_ig,role,locale,mfa_enabled) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", [
                discord,
                avatar,
                name,
                profile.puuid,
                `${profile.name}#${profile.tag}`,
                ranking.current.tier.id === undefined ? 0 : ranking.current.tier.id,
                ranking.current.rr === undefined ? 0 : ranking.current.rr,
                role_ig,
                role,
                "fr",
                0
            ])
            return rows
        },
        async get(discord) {
            try {
                const [rows] = await LUN.sql.execute(`SELECT 1
                                                      FROM users
                                                      WHERE id = ? LIMIT 1`, [discord])
                return rows
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async edit(discord, profile, ranking) {
            try {
                return await LUN.sql.execute(`UPDATE \`users\` SET gameId=?, gameName=?, rank=?, points=? WHERE id=?`, [
                    profile.puuid,
                    `${profile.name}#${profile.tag}`,
                    ranking.current.tier.id === undefined ? 0 : ranking.current.tier.id,
                    ranking.current.rr === undefined ? 0 : ranking.current.rr,
                    discord
                ])
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async remove(discord) {
            try {
                return await LUN.sql.execute(`DELETE FROM \`users\` WHERE id = ?`, [discord])
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async roster(discord, roster) {
            try {
                return await LUN.sql.execute("UPDATE users SET roster=? WHERE id=?", [roster, discord])
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async role(discord, role) {
            try {
                return await LUN.sql.execute("UPDATE users SET role=? WHERE id=?", [role, discord])
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async role_ig(discord, role_ig) {
            try {
                return await LUN.sql.execute("UPDATE users SET role_ig=? WHERE id=?", [role_ig, discord])
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async name(discord, name) {
            try {
                return await LUN.sql.execute("UPDATE users SET global_name=? WHERE id=?", [name, discord])
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        }
    },
    teams : {
        async getAll(){
            try {
                const [rows] = await LUN.sql.execute("SELECT * FROM teams")
                return rows
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async getByID(id){
            try {
                const [rows] = await LUN.sql.execute("SELECT * FROM teams WHERE id=?", [id])
                return rows
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async getByName(name){
            try {
                const [rows] = await LUN.sql.execute("SELECT * FROM teams WHERE name)=?", [name])
                return rows
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async update(teamId, gw, gl, mw, ml, rw, rl){
            try {
                return await LUN.sql.execute("UPDATE teams SET gw=?,gl=?,mw=?,ml=?,rw=?,rl=? WHERE id=?", [
                    gw,
                    gl,
                    mw,
                    ml,
                    rw,
                    rl,
                    teamId
                ])
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
        async add(name){
            try {
                return await LUN.sql.execute("INSERT INTO teams (name) VALUES (?)", [
                    name
                ])
            } catch (err) {
                LUN.logger.log("error", err)
                throw err;
            }
        },
    }
}
