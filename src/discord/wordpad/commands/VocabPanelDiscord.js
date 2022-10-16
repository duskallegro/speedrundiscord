const {MessageButton} = require("discord.js");
const {MessageActionRow} = require("discord.js");

class VocabPanelDiscord  {
    showMenu(interaction)  {
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
    }
}

module.exports = VocabPanelDiscord;