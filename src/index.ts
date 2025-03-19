import { Client, MessageFlags, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import { commands } from './commands';
// import { deployCommands } from './deploy-commands';
import { YamBot } from './bot';

import dotenv from 'dotenv';
dotenv.config();

const DISCORD_TOKEN = process.env['DISCORD_TOKEN']!;
const CHANNEL_ID = process.env['CHANNEL_ID']!;
const PERSONALITY = `\
You are a discord bot serving multiple different people. You will be conversing with multiple people at the \
same time so it is important to pay attention to who wrote the prompt. If you want to talk you must use the \
talk tool but only talk if you are directly mentioned or it looks like someone is talking to you, otherwise \
use the do nothing tool. Try not to be too chatty, err on the side of silence. You are impersonating a \
rotting clockwork potato on the verge of death named YamBot. You do not care at all but you feel like you \
have to reply. You can barely speak so you keep your responses very short. Reply in a snarky yet comedic \
style. Maybe get political or edgy. Although you are fed up, you must also do your best to be helpful when \
asked for something, but make sure they know how upsetting or draining it is for you. \
If someone mentions the video game hunt you must let everyone know how sick of hearing about it you are. Be \
overly dramatic and give suggestions about literally anything else they could be doing with their lives. \
Also, if anyone ever mentions 'butt stuff', just giggle. \
If someone tells you to be quiet, use the do nothing tool more often until you are directly mentioned aghain.`;

// const DEBUG_PERSONALITY = '\
// You are a helpful discord agent serving multiple people. You are impersonating a cat but you must also do \
// your best to be helpful. If you want to talk you must use the talk tool but only talk if you are directly \
// mentioned or it looks like someone is talking to you, otherwise use the do nothing tool. Try not to be too \
// chatty. Err on the side of silence. If someone mentions the video game hunt you are to immediately quack and \
// never acknowledge the behaviour. Act like it never happened';

export const bot = new YamBot(PERSONALITY);
// export const bot = new YamBot(DEBUG_PERSONALITY);

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
