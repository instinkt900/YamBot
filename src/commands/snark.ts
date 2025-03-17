import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { BotCommand } from '../bot-command';

export const snark: BotCommand = {
    commandData: new SlashCommandBuilder().setName('snark').setDescription('Get snarky'),

    execute: async (interaction: CommandInteraction) => {
        await interaction.reply('How snarky');
    }
};
