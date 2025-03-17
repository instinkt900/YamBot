import { REST, Routes } from 'discord.js';
import { commands } from './commands';

import dotenv from 'dotenv';
dotenv.config();

const DISCORD_TOKEN = process.env['DISCORD_TOKEN']!;
const CLIENT_ID = process.env['CLIENT_ID']!;
const GUILD_ID = process.env['GUILD_ID']!;

const rest = new REST().setToken(DISCORD_TOKEN);

export async function deployCommands() {
    try {
        console.log('Started registering application commands.');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
            body: Object.values(commands).map((cmd) => cmd.commandData)
        });
        console.log(`Successfully registered application commands.`);
    } catch (error) {
        console.error(`Failed to register commands: ${error}`);
    }
}
