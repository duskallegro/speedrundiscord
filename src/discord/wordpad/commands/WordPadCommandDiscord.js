const DiscordCommand = require('../../DiscordCommand');
const VocabPanelDiscord = require("./VocabPanelDiscord");
const AddVocabPanel = require("./AddVocabPanel");
const UserInformationCommand = require("../../userinfo/UserInformationCommand");

const axios = require("axios");

class WordPadCommandDiscord extends DiscordCommand  {
    vocabPanel;
    addPanel;

    constructor() {
        super();
        this.vocabPanel = new VocabPanelDiscord();
        this.addPanel = new AddVocabPanel();
    }

    async actionMessageEvent(commandText, message)  {
        switch (commandText)  {
            case "vocabmenu":
                await this.vocabmenuCommand(message);
                return true;
            case "addvocab":
                await this.addVocabCommand(message);
                return true;
            case "removevocab":

                return true;
            case "showvocab":

                return true;
            default:
                return false;
        }
    }

    async actionButtonEvent(buttonInteraction)  {
        let buttonId = buttonInteraction.customId;

        switch (buttonId)  {
            case "vocabmenu":
                await this.vocabmenuCommand(buttonInteraction);
                return true;
            case "add-vocab-button":
                await this.addVocabCommand(buttonInteraction);
                return true;
            case "remove-vocab-button":
                await this.removeVocabCommand(buttonInteraction);
                return true;
            case "show-vocab-button":
                await this.showVocabCommand(buttonInteraction);
                return true;
            default:
                return false;
        }
    }

    async actionModalEvent(modalInteraction)  {
        if (!this.isValidModalEvent(modalInteraction))  {
            return false;
        }

        const foreignWord =
            modalInteraction.fields.getTextInputValue('foreign-word-modal');
        const translation =
            modalInteraction.fields.getTextInputValue('translation-modal');


            let userId = modalInteraction.user.id;
            await this.createWordPair(userId, foreignWord, translation);
            modalInteraction.reply(`You added new foreign word: ${foreignWord} = ${translation}"`);

            return true;
    }

    async createWordPair(discordUserId, foreignWord, translation)  {
        let discordTag = await UserInformationCommand.getUserTag(this.client, discordUserId);
        console.log(discordTag);

        const res = await axios.post('http://localhost:8082/createpair',
            {
                "discordId": discordUserId,
                "foreignWord": foreignWord,
                "translation": translation,
                "foreignLang": "spanish",
                "translationLang": "english",
                "discordTag": discordTag
            });
        return res;
    }

    isValidModalEvent(modalInteraction)  {
        return modalInteraction.customId === 'verification-modal';
    }

    // command methods

    async vocabmenuCommand(message)  {
        await this.vocabPanel.showMenu(message);
    }

    async addVocabCommand(buttonInteraction)  {
        await this.addPanel.show(buttonInteraction);
    }

    async removeVocabCommand()  {

    }

    async showVocabCommand()  {

    }
}

module.exports = WordPadCommandDiscord;