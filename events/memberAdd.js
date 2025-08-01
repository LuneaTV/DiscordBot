module.exports = {
    type: "guildMemberAdd",
    once: false,
    async callback(member) {
        const blacklist = [
            "831526288124411964",
            "823139808494616598",
            "1167935397112848487",
            "805576258422964254",
            "458916041410478081",
            "952300567294779402",
            "743782219218419743",
            "1012392763775520869"
        ]

        if (blacklist.includes(member.id)) {
            member.ban({reason: "Blacklist"})
        }
    }
}