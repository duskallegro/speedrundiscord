const {EmbedBuilder} = require("@discordjs/builders");
const {ButtonBuilder} = require("@discordjs/builders");

const HangmanKeyboardDiscord = require("./HangmanKeyboardDiscord");

class HangmanRiddleDiscord  {
    /**
     * hangman data - taken from the HangmanTaskDiscord class
     */
    hangman;
    /**
     * The Discord message with riddle.
     */
    riddleMessage;
    /**
     * The Embed with riddle.
     * A Discord message contains an embed.
     */
    riddleEmbed;

    fromMemrise;

    keyboardStep;

    interaction;

    constructor(hangman, interaction, fromMemrise = true, keyboardStep) {
        this.hangman = hangman;
        this.interaction = interaction;
        this.fromMemrise = fromMemrise;

        this.keyboardStep = keyboardStep;

        // this.setup();
    }

    async setup()  {
        this.riddleEmbed = this.createRiddleEmbed()[0];
        this.riddleMessage = await this.sendEmbed(this.riddleEmbed, this.interaction);
        console.log("done setup");
    }

    createNewSurrenderButtonsJson()  {
        let json = {
                "type": 1,
                "components": [
                    // buttons
                    {
                        "style": 1,
                        "label": `New Word`,
                        "custom_id": `new_word_button`,
                        "disabled": false,
                        "type": 2
                    },
                    {
                        "style": 4,
                        "label": `Surrender`,
                        "custom_id": `surrender_button`,
                        "disabled": false,
                        "type": 2
                    },
                ]
            };

        return json;
    }

    async sendEmbed(embed, interaction)  {
        let components = [];
        components.push(this.createNewSurrenderButtonsJson());

        let buttonsComponents = HangmanKeyboardDiscord.createButtonRowComponents('A',
                    'P', this.keyboardStep);
        components= [...components, ...buttonsComponents];

        let result = await interaction.channel.send({
            embeds: [embed.data],
            "components": components,
        });

        return result;
    }

    setFinalDescription(newEmoji)  {
        this.riddleMessage.embeds[0].description = this.getValidDescription(newEmoji);
    }

    async updateAttempts()  {
        this.riddleMessage.embeds[0].fields[0] = this.getValidAttemptsField();
        this.riddleMessage.edit({embeds: [this.riddleMessage.embeds[0]]});
    }

    async updateHearts()  {
        this.riddleMessage.embeds[0].fields[1] = this.getValidHeartsField();
        this.riddleMessage.edit({embeds: [this.riddleMessage.embeds[0]]});
    }

    setUpdatedAttempts()  {
        this.riddleMessage.embeds[0].fields[0] = this.getValidAttemptsField();
    }

    setUpdatedHearts()  {
        this.riddleMessage.embeds[0].fields[1] = this.getValidHeartsField();
    }

    setUpdatedDescription()  {
        this.riddleMessage.embeds[0].description = this.getHiddenDescription();
    }

    async update()  {
        await this.riddleMessage.edit({embeds: [this.riddleMessage.embeds[0]]});
    }

    getValidDescription(emoji = '') {
        return "`" + this.hangman.getWordWithRevealedLetters() + "` " + emoji +
            "\n\nHint: " + "`" + this.hangman.secretWord.hint + "`";
    }

    getHiddenDescription()  {
        return "`" + this.hangman.getWordWithHiddenLetters() + "` " +
            "\n\nHint: " + "||" + this.hangman.secretWord.hint + "||";
    }

    createRiddleEmbed()  {
        const result = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Hangman Game')
            .setDescription(this.getHiddenDescription())
            .setThumbnail('https://images-na.ssl-images-amazon.com/images/I/41Kt59CjXmL.png')
            .setTimestamp()

            .addFields(this.getValidAttemptsField(),
                this.getValidHeartsField())

            .setFooter({
                text: 'speedun spanish',
                iconURL: 'https://i.pinimg.com/originals/c5/c2/1c/c5c21cf1354295ccc2ae79f70d28afa4.png'
            });

        if (this.fromMemrise && this.hangman.secretWord.isMemriseWord())  {
            result.addFields({name: 'Source', value: 'Memrise', inline: true},
                {name: 'Level', value: `${this.hangman.secretWord.getLevel()}`, inline: true});
        }

        const newWordButton = new ButtonBuilder()
            .setCustomId("new_hangman_builder")
            .setLabel("New Word")
            .setStyle(1)
            .setDisabled(false);

        newWordButton.type = 2;
        const surrenderButton = new ButtonBuilder()
            .setCustomId("surrender_hangman_button")
            .setLabel("Surrender")
            .setStyle(4)
            .setDisabled(false);

        surrenderButton.type = 2;

        return [result, newWordButton, surrenderButton];
    }

    // helper methods

    getValidAttemptsField = () => {
        return {
            name: 'Attempts', value:
                ` ${this.hangman.heartsLeft}/${this.hangman.totalHearts}`,
            inline: true
        };
    }

    getValidHeartsField = () => {
        let result = {name: 'Hearts', value: ''};

        for (let i = 0; i < this.hangman.heartsLeft; i++) {
            result.value += '❤ ';
        }

        if (result.value === '') {
            result.value = '☹️';
        }

        return result;
    }



}

module.exports = HangmanRiddleDiscord;