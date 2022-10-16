const MemriseReader = require('../../memrise/MemriseReader');
const MemriseWord = require('../../memrise/MemriseWord');
const {randomInRange, getRandomInArray} = require("../../../util");
const ExcelDatabase = require('../../../ExcelDatabase');
const HangmanTaskDiscord = require('./HangmanTaskDiscord');
const DiscordCommand = require('../../DiscordCommand');
const MemriseSecretWord = require('../models/MemriseSecretWord');

class HangmanCommandDiscord extends DiscordCommand {
    /**
     * Contains secret word, embed, keyboard data
     */
    task;
    /**
     * True if there is a pending task,
     * false otherwise.
     */
    gameOn;
    isWorking;

    memriseReader;
    /**
     * A object with arrays by levels:
     * arrays contain MemriseWord objects.
     */
    memriseVocab;

    database;

    NEW_WORD_BUTTON_ID = "new_word_button";
    SURRENDER_BUTTON_ID = "surrender_button";

    constructor() {
        super();

        this.reset();

        // this.setup();
    }

    async setup()  {
        this.database = new ExcelDatabase();

        this.memriseReader = new MemriseReader();
        this.memriseVocab = await this.database.getVocabFromExcelFile();
    }

    async actionMessageEvent(commandText, message)  {
        switch (commandText)  {
            case "hangman":
                await this.commandHangman(message);
                return true;
            case "hang":
                await this.commandHang();
                return true;
            case "surrender":
                await this.surrender();
                return true;
            default:
                return false;
        }
    }

    async actionButtonEvent(buttonInteraction)  {
        if (this.isValidButtonInteraction(buttonInteraction))  {
            await buttonInteraction.deferUpdate();
        }

        let buttonId = buttonInteraction.customId;

        switch (buttonId)  {
            case this.NEW_WORD_BUTTON_ID:
                await this.commandHangman(buttonInteraction);

                return true;
            case this.SURRENDER_BUTTON_ID:
                await this.surrender(buttonInteraction);

                return true;
            default:
                console.log(buttonId);
                if (this.isLetterButton(buttonId)) {
                    console.log("letter button");

                    await this.commandHang(buttonInteraction);
                    return true;
                }

                return false;
        }
    }

    isLetterButton(buttonId)  {
        return buttonId.charAt(0) >= 'A' && buttonId.charAt(0) <= 'Z' &&
            buttonId.charAt(1) === "_";
    }

    isValidButtonInteraction(buttonInteraction)  {
        let buttonId = buttonInteraction.customId;
        return buttonId === this.NEW_WORD_BUTTON_ID || buttonId === this.SURRENDER_BUTTON_ID ||
                this.isLetterButton(buttonId);
    }

    async actionModalEvent(modalInteraction)  {

    }

    async commandHangman(interaction)  {
        // check if there is a pending Hangman task
        if (this.task !== undefined && this.task !== null)  {
            await this.task.keyboard.disable();
        }

        await this.startHangmanGame(interaction);
    }

    async commandHang(interaction)  {
        if (!this.gameOn)  {
            return false;
        }

        try  {
            let component = interaction.component;
            let emojiName = component.label.toLowerCase();

            if (this.task.hangman.isCorrectLetter(emojiName))  {
                component.style = "SUCCESS";
            } else {
                component.style = "DANGER";
            }
            component.disabled = true;
            await interaction.editReply({components: interaction.message.components});

            this.task.hangman.hang(emojiName);

           // await this.task.keyboard.updateSend(emojiName, interaction);

            this.task.riddle.setUpdatedAttempts();
            this.task.riddle.setUpdatedHearts();
            this.task.riddle.setUpdatedDescription();

            await this.task.riddle.update();

            let shouldReset = false;
            if (this.task.hangman.isGuessed())  {
                this.gameOn = false;

                this.task.riddle.setFinalDescription('✅');

                shouldReset = true;
            } else if (!this.task.riddle.hangman.hasHeartsLeft())  {
                this.gameOn = false;

                this.task.riddle.setFinalDescription('❌');

                shouldReset = true;
            }

            // the same as in the old version
            this.task.riddle.update();
            if (shouldReset)  {
                await this.task.keyboard.disable();
                this.reset();
            }
        } catch (e)  {
            console.log(e);
        }
    }

    async startHangmanGame(interaction)  {
        this.gameOn = true;

        let randomWord = this.selectMemriseWordToGuess();

        if (randomWord === null)  {
            return;
        }

        this.task = new HangmanTaskDiscord(new MemriseSecretWord(randomWord),
            interaction);
        await this.task.setup();
    }

    async surrender()  {
        this.gameOn = false;

        try {
           this.task.riddle.setFinalDescription('🏳️');
           await this.task.riddle.update();

           await this.task.keyboard.disable();
           this.reset();
        } catch (e)  {
            console.log(e);
        }

    }

    selectMemriseWordToGuess()  {
        let randomLevel = randomInRange(this.memriseReader.FIRST_LEVEL,
                        this.memriseReader.LAST_LEVEL);

        let wordsAtLevel = this.memriseVocab[randomLevel];

        if (wordsAtLevel === undefined || wordsAtLevel === null)  {
            return null;
        }

        let randomWordIndex = getRandomInArray(wordsAtLevel);

        return wordsAtLevel[randomWordIndex];
    }

    reset = () => {
        this.task = null;
        this.gameOn = false;
        this.isWorking = false;
    }
}

module.exports = HangmanCommandDiscord;