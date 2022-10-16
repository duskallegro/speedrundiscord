const {MessageButton} = require("discord.js");
const {MessageActionRow} = require("discord.js");
const {ButtonBuilder} = require("@discordjs/builders");
const {EmbedBuilder} = require("@discordjs/builders");
const {emojiToolkit} = require("./EmojiToolkit.js");
const {ActionRowBuilder, SelectMenuBuilder, Modal, TextInputComponent} = require('discord.js');
const {makeSimpleCommand, makeComplexCommand} = require("./command.js");

let vocabCommand = makeComplexCommand();

vocabCommand.commands.vocabmenu = makeSimpleCommand("vocabmenu", "Show vocab menu",
    async function (interaction)  {
                            let buttonsRow = new MessageActionRow();
                            buttonsRow.addComponents(
                                new MessageButton()
                                    .setCustomId('show-vocab-button')
                                    .setStyle('SECONDARY')
                                    .setLabel('Show Vocab')
                                    .setEmoji('📘'),
                            );

                            buttonsRow.addComponents(
                                new MessageButton()
                                    .setCustomId('add-vocab-button')
                                    .setStyle('SECONDARY')
                                    .setLabel('Add Vocab')
                                    .setEmoji('✅')
                                ,
                            );

                            buttonsRow.addComponents(
                                new MessageButton()
                                    .setCustomId('remove-vocab-button')
                                    .setStyle('SECONDARY')
                                    .setLabel('Remove Vocab')
                                    .setEmoji('❌'),
                            );
                            interaction.reply({
                                components: [buttonsRow],
                            });
            });
vocabCommand["commands"]["add"] = makeSimpleCommand("add", "Add new word",
                async function (interaction) {

                    const modal = new Modal()
                        .setCustomId('verification-modal')
                        .setTitle('Verify yourself')
                        .addComponents([
                            new MessageActionRow().addComponents(
                                new TextInputComponent()
                                    .setCustomId('foreign-word-modal')
                                    .setLabel('Foreign Word')
                                    .setStyle('SHORT')
                                    .setMinLength(1)
                                    .setMaxLength(30)
                                    .setPlaceholder('')
                                    .setRequired(true),
                            ),

                            new MessageActionRow().addComponents(new TextInputComponent()
                                    .setCustomId('translation-modal')
                                .setLabel("Translation")
                                .setStyle("SHORT")
                                .setMinLength(1)
                                .setMaxLength(30)
                                .setRequired(true)
                            )
                        ]);

                    await interaction.showModal(modal);
                });
vocabCommand.commands.remove = makeSimpleCommand("remove", "Remove a word",
                    async function (interaction)  {
    const modal = new Modal()
        .setCustomId('remove-word-modal')
        .setTitle('Verify yourself')
        .addComponents([
            new MessageActionRow().addComponents(
                new TextInputComponent()
                    .setCustomId('foreign-word-remove-modal')
                    .setLabel('Foreign Word')
                    .setStyle('SHORT')
                    .setMinLength(1)
                    .setMaxLength(30)
                    .setRequired(true),
            ),
        ]);

    await interaction.showModal(modal);
                    });

vocabCommand.commands.display = makeSimpleCommand("display", "Display the words",
              async function (buttonInteraction, userId) {
                        buttonInteraction.deferReply();

                const result = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('Hangman Game')
                    .setDescription('Your vocabulary')
                    .setTimestamp()
                    .addFields({name: 'Pair', value: JSON.stringify(vocabCommand.database.get(userId)),
                        inline: true})

                    .setFooter({ text: 'speedun spanish', iconURL: 'https://i.pinimg' +
                            '.com/originals/c5/c2/1c/c5c21cf1354295ccc2ae79f70d28afa4.png' });

                       await buttonInteraction.channel.send({embeds: [result.data]});
                        await buttonInteraction.editReply({});
              }

            );


const userVocabs = {

};

vocabCommand.database = {};
vocabCommand.database.add = function(foreignWord, translation, userId)  {
    if (!Object.hasOwn(userVocabs, userId))  {
        userVocabs[userId] = [];
    }

    userVocabs[userId].push({
        'foreignWord': foreignWord,
        'translation': translation
    });
}

vocabCommand.database.get =  function (userId)  {
    if (!Object.hasOwn(userVocabs, userId))  {
        return "No Vocab Avaliable!";
    }

    return userVocabs[userId];
}

vocabCommand.database.remove = function (userId, foreignWord)  {
    if (!Object.hasOwn(userVocabs, userId))  {
        return false;
    }

    let vocab = userVocabs[userId];
    if (vocab.size === 0)  {
        return false;
    }

    let oldSize = vocab.length;
    userVocabs[userId] = vocab.filter(pair => pair['foreignWord'] !== foreignWord);
    return oldSize > userVocabs[userId].length;
}



module.exports = {vocabCommand};