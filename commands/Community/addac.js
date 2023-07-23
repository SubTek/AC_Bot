// ./commands/addac.js

const { SlashCommandBuilder } = require('@discordjs/builders');

function parseTime(timeStr) {
    let totalMinutes = 0;
    const daysMatch = timeStr.match(/(\d+)d/);
    const hoursMatch = timeStr.match(/(\d+)h/);
    const minutesMatch = timeStr.match(/(\d+)m/);

    if (daysMatch) {
        totalMinutes += parseInt(daysMatch[1]) * 24 * 60;
    }
    
    if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1]) * 60;
    }

    if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1]);
    }

    return totalMinutes;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addac')
        .setDescription('Add a new AC timer')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of AC')
                .setRequired(true)
                .addChoices(
                    { name: 'Gathering', value: 'Gathering'},
                    { name: 'Production', value: 'Production'},
                    { name: 'Battle Analysis', value: 'Battle Analysis'},
                    { name: 'Research', value: 'Research'},
                    { name: 'Construction', value: 'Construction'},
                    { name: 'Weapon', value: 'Weapon'},
                    { name: 'Armor', value: 'Armor'},
                    { name: 'Vehicle', value: 'Vehicle'}
                ))
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Level of AC')
                .setRequired(true)
                .addChoices(
                    { name: '1', value: 1},
                    { name: '2', value: 2},
                    { name: '3', value: 3},
                    { name: '4', value: 4}
                ))
        .addStringOption(option =>
            option.setName('coordinates')
                .setDescription('Coordinates of AC')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time for the AC to expire (e.g., 1d14h1m for 1 day 14 hours 1 minute)')
                .setRequired(true)),
    async execute(interaction, db, client) {
        // Access control, allow only R4 role to execute the command
        if (!interaction.member.roles.cache.some(role => role.name === 'R4')) {
            return interaction.reply({ content: 'You do not have the permission to execute this command.', ephemeral: true });
        }

        const ACType = interaction.options.getString('type');
        const level = interaction.options.getInteger('level');
        const coordinates = interaction.options.getString('coordinates');
        const timeStr = interaction.options.getString('time');
        const time = parseTime(timeStr);

        // Coordinate validation
        if (!/^(\d+):(\d+)$/.test(coordinates)) {
            return interaction.reply({ content: 'Coordinates must be in the format x:y where x and y are positive integers.', ephemeral: true });
        }

        // Time validation
        if (time <= 0) {
            return interaction.reply({ content: 'Time must be a positive value.', ephemeral: true });
        }

        db.run(`INSERT INTO AC(userId, ACType, level, coordinates, time) VALUES(?, ?, ?, ?, ?)`,
            [interaction.user.id, ACType, level, coordinates, Date.now() + time * 60 * 1000],
            function(err) {
                if (err) {
                    return interaction.reply({ content: 'Failed to add the AC timer.', ephemeral: true });
                }

                const countdown = time * 60 * 1000;
                setTimeout(async () => {
                    const channel = await client.channels.fetch('CHANNEL_ID'); // Replace CHANNEL_ID with the ID of the #AC channel
                    if (channel) {
                        channel.send(`@here Level ${level} ${ACType} Analysis Center at ${coordinates} open send troops!`);
                    }
                }, countdown);

                return interaction.reply({ content: `The AC timer was added successfully!`, ephemeral: true });
            }
        );
    },
};
