import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export interface BotCommand {
    commandData: SlashCommandBuilder;
    execute: (interaction: CommandInteraction) => Promise<void>;
}
