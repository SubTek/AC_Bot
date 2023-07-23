// ./commands/listac.js

const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listac')
        .setDescription('List all AC timers'),
    async execute(interaction, db) {
        // Access control, allow only R4 role to execute the command
        if (!interaction.member.roles.cache.some(role => role.name === 'R4')) {
            return interaction.reply({ content: 'You do not have the permission to execute this command.', ephemeral: true });
        }

        db.all(`SELECT * FROM AC`, [], (err, rows) => {
            if (err) {
                return interaction.reply({ content: 'Failed to retrieve the AC timers.', ephemeral: true });
            }

            let message = 'AC timers:\n';
            rows.forEach((row) => {
                const remainingTime = Math.max(0, Math.ceil((row.time - Date.now()) / 1000 / 60)); // in minutes
                message += `ID: ${row.id}, Type: ${row.ACType}, Level: ${row.level}, Coordinates: ${row.coordinates}, Remaining time: ${remainingTime} minutes\n`;
            });

            return interaction.reply({ content: message, ephemeral: true });
        });
    },
};
