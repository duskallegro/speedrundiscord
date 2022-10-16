const {MessageActionRow} = require("discord.js");
const {Modal} = require("discord.js");
const {Client, Intents, TextInputComponent} = require('discord.js');

const {token, prefix, VOCAB_FILE_NAME, VOCAB_SHEET_NAME} = require("../../../config");

const {helpCommand} = require("./help.js");
const {diceCommand} = require("./dice.js");
const {hangCommand} = require("./hangman.js");
const {emojiToolkit} = require("./EmojiToolkit.js");
const {vocabCommand} = require("./vocabManager.js");



const emojis = {
    "question": {
        "id": "",
        command: "help"
    },
    "game_die": {
        "id": "",
        command: "dice"
    },
    "flag_white": {
        "id": "",
        command: "idk"
    }
};

const findEmojiId = async (message, name) => {
    let result = await message.guild.emojis.cache?.find(emoji => emoji.name === name);
    return result;
};

// const allCommands = [helpCommand, diceCommand, hangCommand, vocabCommand];
const allCommands = [helpCommand, diceCommand, hangCommand, vocabCommand];

const commands = {
    "idk": {
        "name": "surrender",
        "description": "Find out the secret word",
        "command": function (interaction) {
            if (currentVocabSecret == null) {
                interaction.reply("**No secret word yet!**");
                return;
            }

            interaction.reply(printedSecretWord());
        }
    },

};


const client = new  Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS",
        "DIRECT_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_EMOJIS_AND_STICKERS"]
/*    intents: [Client.Intents.FLAGS.GUILDS,
        Client.Intents.FLAGS.GUILD_MESSAGES]*/
  /*  intents: [
        Client.Intents.FLAGS.GUILDS,
        Client.Intents.FLAGS.GUILD_MEMBERS,
    ]*/
});

let vocab = null;
let splitVocab = null;

client.once('ready', async () => {
    console.log("Ready!");
    vocab = await getVocabFromExcelFile();
    splitVocab = await splitIntoLevels(vocab);

    const eee = client.emojis;
    const cache = client.emojis.cache;
    const ayy = client.emojis.cache.get("305818615712579584");
    console.log();

    const guild = await client.guilds.fetch('935376899834794044');
    const channel = guild.channels.cache.get('935763396723372062');

    // let emojis = await guild.emojis.fetch();
   // console.log(emojis.size);

    let members = await guild.members.fetch();
    console.log(members.size);


    allCommands.forEach((command) => {
        // commands[command.name] = {};

        /*Object.entries(command.commands).forEach(([key, value]) =>  {
            commands[key] = {};
            commands[key].command = value.action;
            console.log();
        });*/

        console.log(commands);

        command.vocab = vocab;
        command["splitVocab"] = splitVocab;
        command.client = client;
    });
});
client.login(token);

client.on("messageCreate", async (interaction) => {
    interaction.awaitReactions()

    if (interaction.author.bot) {
        return;
    }

    let message = interaction.content;

    console.log("new message: " + message);

    if (!message.startsWith(prefix)) {
        return;
    }

    let aID = '1014913858240008202';
    //let emoji = client.emojis.get("ID")
    var emoji = interaction.guild.emojis.cache.find(emoji => emoji.name === ':smile:');

    console.log(interaction.guild.emojis);

   emoji =  interaction.guild.emojis.cache.find(e => e === ':smile:');

   console.log(interaction.guild.emojis.cache);

   console.log("emojis:")
   interaction.guild.emojis.cache.map(e => console.log(e));

   emoji = interaction.guild.emojis.cache.get('1014913858240008202');

   emoji = emojiToolkit.findEmojiByName('A');
   interaction.react(emoji);

    let trueCommand = message.substring(prefix.length);

    // find command by name
    let command = commands[trueCommand];

    let foundCommand = false;
    if (command === undefined) {
        let elements = trueCommand.split(" ");
        command = commands[elements[0]];

        /*elements.forEach((e) => {
            if (!foundCommand && commands[e] !== undefined) {
                command = commands[e];
                foundCommand = true;

            }

            console.log("command = " + command);
        });*/
    }

    if (command !== undefined) {
        command.chooser(interaction);
    } else {
        interaction.reply("**Unknown command!**");
    }
    // await interaction.reply("Hey");
});

const getVocabFromExcelFile = async () => {
    const reader = require("xlsx");

    let file = reader.readFile("../" + VOCAB_FILE_NAME);

    const sheet = file.Sheets[VOCAB_SHEET_NAME];

    const data = reader.utils.sheet_to_json(sheet);

    //console.log(data);

    return data;
};

const splitIntoLevels = (vocab) => {
    const result = {};

    for (let i = 0; i < vocab.length; i++) {
        let v = vocab[i];

        if (!result.hasOwnProperty(v.level)) {
            result[v.level] = [];
        }

        result[v.level].push(v);
    }

    return result;
};


client.on("interactionCreate", async (interaction, user) =>  {
    console.log("interaction create");
    /*let reply = await interaction.reply({content: "Thanks for choosing!"});
    reply.delete();*/
    // interaction.deferUpdate();

    if (interaction.isModalSubmit())  {
        if (interaction.customId === 'verification-modal') {
            const foreignWord =
                interaction.fields.getTextInputValue('foreign-word-modal');
            const translation =
                interaction.fields.getTextInputValue('translation-modal');

            interaction.reply(`You added new foreign word: ${foreignWord} = ${translation}"`);

            vocabCommand.database.add(foreignWord, translation, interaction.user.id);

            return;
        }

        if (interaction.customId === 'remove-word-modal')  {
            const foreignWord =
                interaction.fields.getTextInputValue('foreign-word-remove-modal');

            let success = vocabCommand.database.remove(interaction.user.id, foreignWord);

            interaction.reply({content: `Success: ${success}`});

            return;
        }

        return;
    }

    if (interaction.isButton()) {
        if (interaction.customId === "add-vocab-button")  {
            vocabCommand.commands.add.action(interaction);

            return;
        }

        if (interaction.customId === "remove-vocab-button")  {
            vocabCommand.commands.remove.action(interaction);

            return;
        }

        if (interaction.customId === "show-vocab-button")  {
            vocabCommand.commands.display.action(interaction, interaction.user.id);

            return;
        }

        if (interaction.customId === 'verification-button') {
            const modal = new Modal()
                .setCustomId('verification-modal')
                .setTitle('Verify yourself')
                .addComponents([
                    new MessageActionRow().addComponents(
                        new TextInputComponent()
                            .setCustomId('verification-input')
                            .setLabel('Answer')
                            .setStyle('SHORT')
                            .setMinLength(4)
                            .setMaxLength(12)
                            .setPlaceholder('ABCDEF')
                            .setRequired(true),
                    ),
                ]);
           // interaction.deferReply();

            await interaction.showModal(modal);
            //interaction.editReply({ content: "replied" });

            return;
        }

        if (interaction.customId === "new_word_button")  {
            hangCommand.commands.hangman.action(interaction);
            return;
        } else if (interaction.customId === "surrender_button")  {
            hangCommand.commands.surrender.action(interaction);
            return;
        }

        let customId = interaction.customId;
        //await interaction.update({components: []})
        let component = interaction.component;
        let label = component.label;

        hangCommand.commands.hang.action(label, interaction, user);

        //let object = client.buttons.get(interaction.customId);
        console.log();
    }

    if (interaction.customId === 'lettersHalfMenu') {
        await interaction.reply({content: "Thanks for choosing!"});

        let value = interaction.values[0];

        let lettersToReact;
        if (value === "am") {
            lettersToReact = emojiToolkit.getLettersEmojisInRange("A", 'M');
            // interaction.react(lettersToReact[0]);
        } else  {
            lettersToReact = emojiToolkit.getLettersEmojisInRange("N", 'Z');
        }

        let m =  interaction.message;
        await m.reactions.removeAll();

        lettersToReact.forEach((letter) =>  {
            m.react(letter);
        })

    }

  //  interaction.editReply();
});

client.on('messageReactionAdd', (messageReaction, user) => {
    if (user.bot)  {
        return;
    }

    let emoji = messageReaction._emoji.name;
    let emojiName = emojiToolkit.findNameByEmoji(emoji);

    hangCommand.commands.hang.action(emojiName, messageReaction, user);
});



(async () => {
    // const vocab = await getVocabFromExcelFile();


})();
