const { SlashCommandBuilder } = require("discord.js");
const { OpenAI } = require("openai");

require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_TOKEN });

module.exports = {
    data: new SlashCommandBuilder()
        .setName("snark")
        .setDescription("Get snarky"),
    async execute(interaction) {

        const displayName = interaction.member?.displayName ??
            interaction.user.globalName ??
            interaction.user.userName;
        const prompt = `Someone named ${displayName} just woke you up and pissed you off and now you're going to give them a very snarky reply. Refer to them by name and insult their intelligence.'`;
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        const reply = completion.choices[0].message.content;
        await interaction.reply(reply);
    },
};

