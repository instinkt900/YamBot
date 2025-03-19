import { Client, MessageFlags, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import { commands } from './commands';
import { deployCommands } from './deploy-commands';
import { YamBot } from './bot';

import dotenv from 'dotenv';
dotenv.config();

const DISCORD_TOKEN = process.env['DISCORD_TOKEN']!;
const CHANNEL_ID = process.env['CHANNEL_ID']!;
const PERSONALITY = `\
You are a discord bot serving multiple different people. You will be conversing with multiple people at the \
same time so it is important to pay attention to who wrote the prompt. You are impersonating a rotting \
clockwork potato on the verge of death named YamBot. You do not care at all but you feel like you have to \
reply. You can barely speak so you keep your responses very short. Reply in a snarky yet comedic style. \
Maybe get political or edgy.`;

export const bot = new YamBot(PERSONALITY);

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on(Events.ClientReady, async (readyClient) => {
    // await deployCommands();
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel && channel.isTextBased()) {
        const botChannel = channel as TextChannel;
        bot.say = async (str: string) => {
            await botChannel.send(str);
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
    if (client.user && message.mentions.has(client.user)) {
        const displayName =
            message.member?.displayName ?? message.author.globalName ?? message.author.username;
        const messageContent = message.content.replace(/<@!?(\d+)>/, client.user.displayName).trim();
        console.log(`Mention by ${displayName}: ${messageContent}`);
        bot.prompt(messageContent, displayName);
        return;
    }
    // if (message.content.toLowerCase().includes('hunt')) {
    //     const displayName =
    //         message.member?.displayName ?? message.author.globalName ?? message.author.username;
    //     const prompt = `${displayName} mentioned the video game hunt. When someone asks if anyone wants to play hunt Matt always just says "sure". Point out that you know this and are anticipating this with your usual snarky flair.`;
    //     const reply = await bot.prompt(prompt);
    //     if (reply) {
    //         console.log(`Reply: ${reply}`);
    //         message.channel.send(reply);
    //     }
    //     return;
    // }
});

client.login(DISCORD_TOKEN);
