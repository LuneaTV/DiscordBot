const { PermissionFlagsBits, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('clear')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async button(interaction) {
        if (interaction.guild.id !== LUN.config.guildID) return;
        await interaction.deferReply({ content: "En cours de chargement..", ephemeral: true })

        if (interaction.customId.split("_")[1] === "cancel") {
            await interaction.editReply({ content: LUN.config.emotes.error + "La commande a été annulée", ephemeral: true });
            LUN.db.logs(3, "Commande - clear", "Annulation de la commande clear suite à l'input utilisateur")
            return;
        } else {
            await interaction.editReply({ content: LUN.config.emotes.loading + "Supressions des messages en cours...", ephemeral: true });

            await interaction.channel.messages.fetch(interaction.customId.split("_")[1])
                .then(async (originMessage) => {
                    await interaction.channel.messages.fetch({
                        limit: 100
                    }).then(async (messages) => {
                        messages.forEach((message) => {
                            if (message.createdTimestamp >= originMessage.createdTimestamp) {
                                LUN.db.logs(4, "Commande - clear", "Supression d'un message de " + message.author + ", contenu : " + message.content)
                                LUN.bulkDeleted.push(message.id);
                                try {
                                    message.delete();
                                } catch (e) {
                                    LUN.db.logs(1, "Commande - clear", "Impossible de supprimer le message de " + message.author + ", contenu : " + message.content)
                                }

                            }
                        })

                        await interaction.editReply({ content: LUN.config.emotes.success + "Les messages sont en cours de supression !", ephemeral: true });
                    })

                })
                .catch(console.error);

            LUN.db.logs(3, "Commande - clear", "Clear des messages après le " + interaction.customId)

            LUN.moderation.mod(
                "Supression massive de message",
                ` ${interaction.member} a supprimés une grande quantité de messages dans ${interaction.channel}`,
                false,
                2,
                interaction.channel.id)
        }
    },

}

