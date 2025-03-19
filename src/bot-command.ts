import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { YamBot } from './bot';

export interface BotCommand {
    commandData: SlashCommandBuilder;
    execute: (bot: YamBot, interaction: CommandInteraction) => Promise<void>;
}
