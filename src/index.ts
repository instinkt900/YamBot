import { Client, MessageFlags, Events, GatewayIntentBits } from 'discord.js';
import { commands } from './commands';
import { deployCommands } from './deploy-commands';
import { bot } from './bot';

import dotenv from 'dotenv';
dotenv.config();

const DISCORD_TOKEN = process.env['DISCORD_TOKEN']!;
const CHANNEL_ID = process.env['CHANNEL_ID']!;
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.on(Events.ClientReady, async (readyClient) => {
    await deployCommands();
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands[interaction.commandName];

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
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
        console.log(`Mention by ${displayName}: ${message.content}`);
        const messageContent = message.content.replace(/<@!?(\d+)>/, client.user.displayName).trim();
        const instructions = `${displayName} gave the prompt if you need to refer to them by name.`;
        const reply = await bot.prompt(messageContent, instructions);
        if (reply) {
            console.log(`Reply: ${reply}`);
            message.channel.send(reply);
        }
        return;
    }
    if (message.content.toLowerCase().includes('hunt')) {
        const displayName =
            message.member?.displayName ?? message.author.globalName ?? message.author.username;
        const prompt = `${displayName} mentioned the video game hunt. When someone asks if anyone wants to play hunt Matt always just says "sure". Point out that you know this and are anticipating this with your usual snarky flair.`;
        const reply = await bot.prompt(prompt);
        if (reply) {
            console.log(`Reply: ${reply}`);
            message.channel.send(reply);
        }
        return;
    }
});

client.login(DISCORD_TOKEN);
