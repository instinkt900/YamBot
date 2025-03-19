import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import { BotCommand } from '../bot-command';
import { YamBot } from '../bot';

export const snark: BotCommand = {
    commandData: new SlashCommandBuilder().setName('snark').setDescription('Get snarky'),

    execute: async (_bot: YamBot, _interaction: CommandInteraction) => {
        // const displayName =
        //     interaction.user?.displayName ?? interaction.user.globalName ?? interaction.user.username;
        // const prompt = `${displayName} just woke you up because they've got nothing better to do than poke you and see what happens. Show them what happens.`;
        // const reply = await bot.prompt(prompt);
        // if (reply) {
        //     console.log(`Reply: ${reply}`);
        //     await interaction.reply(reply);
        // }
        console.log('disabled');
    }
};
