class HangmanKeyboardDiscord {
    firstKeyboardMessage;
    secondKeyboardMessage;
    disabled;

    keyboardStep;

    interaction;

    firstLetters;
    secondLetters;

    constructor(firstKeyboardMessage, interaction, keyboardStep) {
        this.disabled = false;
        this.keyboardStep = keyboardStep;

        this.firstKeyboardMessage = firstKeyboardMessage;
        this.interaction = interaction;

        this.firstLetters = [];
        this.secondLetters = [];

        // this.setup();
    }

    async updateSend(letter, buttonInteraction) {
        // await this.firstKeyboardMessage.edit({components: this.firstKeyboardMessage.components});
        // await this.secondKeyboardMessage.edit({components: this.secondKeyboardMessage.components});

        if (HangmanKeyboardDiscord.isLetterInKeyboard(letter, this.firstKeyboardMessage)) {
            await buttonInteraction.editReply({components: this.firstKeyboardMessage.components});
        } else if (HangmanKeyboardDiscord.isLetterInKeyboard(letter, this.secondKeyboardMessage))  {
            await buttonInteraction.editReply({components: this.secondKeyboardMessage.components});
        }
    }

    async setup()  {
        this.secondKeyboardMessage = await this.sendKeyboard(this.interaction);
    }

    async sendKeyboard(interaction)  {
        let components = HangmanKeyboardDiscord.createButtonRowComponents('Q', 'Z', this.keyboardStep);

        let result = await interaction.channel.send({
            embeds: [],
            components: components
        });

        return result;
    }

    static isLetterInKeyboard(letter, keyboardMessage)  {
        let components = keyboardMessage.components;
        letter = letter.toUpperCase();

        return components.some((messageRow) =>  {
            let buttons = messageRow.components;

            return buttons.some((button) =>  {
                let label = button.label;

                if (label === letter)  {
                    return true;
                }

                return false;
            })
        });
    }

    static createKeyboardJson(start, end)  {
        return {
            "type": 1,
            "components": this.createLettersButtons(start, end)
        };
    }

    static createLettersButtons = (start, end) => {
        let result = [];

        for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
            let emoji = String.fromCharCode(i);
            result.push({
                "style": 2,
                "label": `${emoji}`,
                "custom_id": `${emoji}_button`,
                "disabled": false,
                "type": 2
            });
        }

        return result;
    };

    static createButtonRowComponents(finalStart, finalEnd, step, array = [])  {
        let components = [];

        for (let i = finalStart.charCodeAt(0); i <= finalEnd.charCodeAt(0); i += step)  {
            let start = String.fromCharCode(i);
            let end = String.fromCharCode(i + step - 1);

            if (end.charCodeAt(0) > finalEnd.charCodeAt(0))  {
                end = finalEnd;
            }

            components.push(HangmanKeyboardDiscord.createKeyboardJson(start, end));
        }

        return components;
    }

    async disable()  {
        if (!this.isValid())  {
            return false;
        }

        let firstKeyboardPart = this.firstKeyboardMessage.components;
        let secondKeyboardPart = this.secondKeyboardMessage.components;

        let allComponents = firstKeyboardPart.concat(secondKeyboardPart);
        allComponents.forEach(row => {
            let rowComponents = row.components;

            rowComponents.forEach(button => {
                if (button.type === "BUTTON" && button.customId !== "new_word_button") {
                    button.disabled = true;
                }
            });
        });

        await this.firstKeyboardMessage.edit({components: firstKeyboardPart});
        await this.secondKeyboardMessage.edit({components: secondKeyboardPart});

        this.disabled = true;

        return true;
    }

    isValid() {
        return !(this.firstKeyboardMessage === null || this.secondKeyboardMessage === null);
    }

    isDisabled()  {
        return this.disabled;
    }
}

module.exports = HangmanKeyboardDiscord;