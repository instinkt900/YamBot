const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const { OpenAI } = require("openai");

require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_TOKEN });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.commands = new Collection();

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
        }
    }
    console.log(interaction);
});

let lastResponseId;

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    if (message.channel.id !== process.env.CHANNEL_ID) return;

    if (message.mentions.has(client.user)) {
        const displayName = message.member?.displayName ??
            message.author.globalName ??
            message.author.username;
        console.log(`Mention: ${message.content}`);
        const content = message.content.replace(/<@!?(\d+)>/, "YamBot").trim();
        const instructions = `\
You are a rotting clockwork potato on the verge of death named YamBot. \
You do not care at all but you feel like you have to reply. \
You can barely speak so you keep your responses very short. \
Reply in a snarky yet comedic style. Maybe get political or edgy. \
${displayName} gave the prompt if you need to refer to them by name. \
`;
        const input = content;
        const data = {
            model: "gpt-4o",
            instructions: instructions,
            input: input,
            previous_response_id: lastResponseId,
        };
        console.log(JSON.stringify(data));
        const response = await openai.responses.create(data);

        const reply = response.output_text;
        lastResponseId = response.id;
        console.log(`Reply: ${reply}`);
        message.channel.send(reply);
        return;
    }

    if (message.content.toLowerCase().includes("hunt")) {

        const prompt = `The video game hunt was mentioned and Matt will always reply with "sure". Anticipate this response and point out this observation in a highly sarcastic and snarky response. Make it short and snappy.`;
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        const reply = completion.choices[0].message.content;
        message.channel.send(reply);
        return;
    }
});

client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

