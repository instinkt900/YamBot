import { Client, MessageFlags, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import { commands } from './commands';
// import { deployCommands } from './deploy-commands';
import { BotConfig, YamBot } from './bot';

import dotenv from 'dotenv';
dotenv.config();

const DISCORD_TOKEN = process.env['DISCORD_TOKEN']!;
const CHANNEL_ID = process.env['CHANNEL_ID']!;
const BOT_CONFIG_PATH = process.env['BOT_CONFIG']!;

const botConfig = new BotConfig(BOT_CONFIG_PATH);
export const bot = new YamBot(botConfig);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on(Events.ClientReady, async (readyClient) => {
    // await deployCommands();
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
        const botChannel = channel as TextChannel;
        bot.say = (str: string) => {
            botChannel.send(str);
        };
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands[interaction.commandName];

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(bot, interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.reply({
                content: 'There was an error while executing this command!',
                flags: MessageFlags.Ephemeral
            });
        }
    }
    console.log(interaction);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;
    const displayName = message.member?.displayName ?? message.author.globalName ?? message.author.username;
    const messageContent = message.cleanContent;
    console.log(`Message from ${displayName}: ${messageContent}`);
    bot.prompt(messageContent, displayName);
});

client.login(DISCORD_TOKEN);
