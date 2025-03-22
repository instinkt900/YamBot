import 'source-map-support/register.js';
import { Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import { YamBot, BotConfig } from 'yambot';

import dotenv from 'dotenv';
dotenv.config();

const OPENAI_TOKEN = process.env['OPENAI_TOKEN']!;
const DISCORD_TOKEN = process.env['DISCORD_TOKEN']!;
const CHANNEL_ID = process.env['CHANNEL_ID']!;
const BOT_CONFIG_PATH = process.env['BOT_CONFIG']!;

const botConfig = new BotConfig(BOT_CONFIG_PATH);
export const bot = new YamBot(botConfig, OPENAI_TOKEN);

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

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.channel.id !== CHANNEL_ID) return;
    const displayName = message.member?.displayName ?? message.author.globalName ?? message.author.username;
    const messageContent = message.cleanContent;
    console.log(`Message from ${displayName}: ${messageContent}`);
    bot.prompt(messageContent, displayName);
});

client.login(DISCORD_TOKEN);
