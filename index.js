require("dotenv").config();

const { Client, MessageEmbed, MessageButton } = require("discord.js");
const ms = require("ms");

const client = new Client({ intents: 32767 });
client.embed = new MessageEmbed();
client.config = {
    logs: "1181233729499320352",
    welcome: "1181234752418754642",
    role: "1181245497021833297"
}

client.on("ready", () => {
    console.log("Bot online!");


    client.user.setStatus("idle");
    client.user.setActivity(`Moderando o melhor servidor!`);
});


client.on("guildMemberAdd", (member) => {
    member.roles.add(client.config.role).catch(() => { return });

    client.embed
    .setColor("#4980f6")
    .setDescription(`➔ **${member.user.username}**, Seja bem-vindo(a) ao servidor!\n\n➔ Para **acessar** as aulas, fique atento em <#1181246315875811338>.\n➔ Caso tenha **dúvidas**, descreva em <#1181234677881782352>.\n➔ E sinta-se à vontade para **compartilhar** seus códigos em <#1181234989346598982>`)
    
    member.guild.channels.cache.get(client.config.welcome).send({ 
        embeds: [client.embed]
    }).then(m => setTimeout(() => m.delete(), 10000)).catch(() => { return });
});

client.on("messageCreate", async (msg) => {
    let regexp = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|(discord|discordapp)\.com\/invite)\/.+[a-z]/g;
    let members = [];

    if (regexp.test(msg.content)) {
        if (members.includes(msg.author.id)) return msg.delete() && msg.member.ban({ reason: "Proteção AntiLink.", days: 365 }) && members.slice(msg.author.id);

        msg.delete();
        members.push(msg.author.id);

        client.embed
        .setColor("#4980f6")
        .setDescription(`➔ **${msg.author.username}**, Infelizmente você não pode estar enviando **links** de outros servidores aqui.\n\n➔ Devo te **punir?**`)
        
        const message = await msg.channel.send({ 
            content: `${msg.author}`,
            embeds: [client.embed],
            components: [
                {
                    type: 1,
                    components: [
                        new MessageButton()
                        .setCustomId("punir")
                        .setStyle("PRIMARY")
                        .setLabel("Pode me dar bannnn!"),

                        new MessageButton()
                        .setCustomId("npunir")
                        .setStyle("DANGER")
                        .setLabel("Não me da bannnn!"),
                    ]
                }
            ]
        })

        const collector = await message.channel.createMessageComponentCollector({ componentType: "BUTTON", time: 10000, max: 1 });
        collector.on("collect", async (interaction) => {
            if (![interaction.user.id].includes(msg.author.id) && !interaction.member.roles.cache.filter(r => r.id === "1181234811994648619")) return interaction.deferUpdate();

            switch (interaction.customId) {
                case 'punir': {
                    client.embed 
                    .setColor("#4980f6")
                    .setDescription(`➔ O usuário foi banido temporáriamente, em **7 dias** poderá voltar.\n\n➔ Membro punido: **${msg.author.username}**\n➔ Moderador: ${interaction.user}\n➔ Motivo: **Proteção de AntiLink.**`)
                        

                    await interaction.guild.members.ban(msg.author.id, { reason: "Proteção AntiLink", days: 7 }).catch(() => { return });
                    await message.edit({ 
                        content: `${interaction.user}`,
                        embeds: [client.embed],
                        components: []
                    }).then((m) => setTimeout(() => m.delete(), 5000))

                    
                    interaction.guild.channels.cache.get(client.config.logs).send({
                        content: `${interaction.user}`,
                        embeds: [client.embed],
                        components: []
                    })

                    members.slice(msg.author.id);
                    collector.stop();
                    break;
                }

                case 'npunir': {
                    client.embed
                    .setColor("#4980f6")
                    .setDescription(`➔ O usuário não foi banido, mas recebeu um castigo de **10 minutos**.\n\n➔ Membro punido: **${msg.author.username}**\n➔ Moderador: ${interaction.user}\n➔ Motivo: **Proteção de AntiLink.**`)
                    
                    await msg.member.timeout(ms("10m"), "Sistema de proteção AntiLink.").catch(() => { return });
                    await message.edit({ 
                        content: `${interaction.user}`,
                        embeds: [client.embed],
                        components: []
                    }).then((m) => setTimeout(() => m.delete(), 5000))

                    interaction.guild.channels.cache.get(client.config.logs).send({
                        content: `${interaction.user}`,
                        embeds: [client.embed],
                        components: []
                    });

                    members.slice(msg.author.id);
                    collector.stop();
                    break;
                }
            }
        })

        collector.on("end", async (collected, reason) => {
            if (reason == "time") {
                client.embed
                .setColor("#4980f6")
                .setDescription(`➔ O usuário foi banido temporáriamente, em **7 dias** poderá voltar.\n\n➔ Membro punido: **${msg.author.username}**\n➔ Moderador: ${interaction.user}\n➔ Motivo: **Proteção de AntiLink.**`)
            

                await interaction.guild.members.ban(msg.author.id, { reason: "Proteção AntiLink", days: 7 }).catch(() => { return });
                await message.edit({ 
                    content: `${msg.author}`,
                    embeds: [client.embed],
                    components: []
                }).then((m) => setTimeout(() => m.delete(), 5000))

                interaction.guild.channels.cache.get(client.config.logs).send({
                    content: `${msg.author}`,
                    embeds: [client.embed],
                    components: []
                })

                members.slice(msg.author.id);
            }
        })
    }
});

client.login(process.env.token);