// ./commands/removeac.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeac')
        .setDescription('Remove an AC timer')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('ID of the AC timer to remove')
                .setRequired(true)),
    async execute(interaction, db) {
        // Access control, allow only R4 role to execute the command
        if (!interaction.member.roles.cache.some(role => role.name === 'R4')) {
            return interaction.reply({ content: 'You do not have the permission to execute this command.', ephemeral: true });
        }

        const id = interaction.options.getInteger('id');

        db.run(`DELETE FROM AC WHERE id = ?`, id, function(err) {
            if (err) {
                return interaction.reply({ content: 'Failed to remove the AC timer.', ephemeral: true });
            }

            return interaction.reply({ content: `The AC timer with ID ${id} was removed successfully!`, ephemeral: true });
        });
    },
};