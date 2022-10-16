const {MessageButton} = require("discord.js");
const {MessageActionRow} = require("discord.js");
const {Modal} = require("discord.js");
const {TextInputComponent} = require("discord.js");

class AddVocabPanel  {
    async show(buttonInteraction) {
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

        await buttonInteraction.showModal(modal);
    }
}

module.exports = AddVocabPanel;