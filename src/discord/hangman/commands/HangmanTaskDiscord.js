const HangmanRiddleDiscord = require('./HangmanRiddleDiscord');
const HangmanKeyboardDiscord = require('./HangmanKeyboardDiscord');
const Hangman = require('../models/Hangman');

class HangmanTaskDiscord {
    /**
     * Contains secret word data
     */
    hangman;
    /**
     * Contains the embed and Discord message data
      */
    riddle;
    /**
     * Contains the keyboard Discord message data
      */
    keyboard;

    keyboardStep;

    interaction;

    constructor(secretWord, interaction, keyboardStep = 4) {
        this.hangman = new Hangman('', '', secretWord);
        this.keyboardStep = keyboardStep;
        this.interaction = interaction;
    }

    async setup()  {
        this.riddle = new HangmanRiddleDiscord(this.hangman, this.interaction,
            true, this.keyboardStep);
        await this.riddle.setup();

        this.keyboard = new HangmanKeyboardDiscord(this.riddle.riddleMessage,
            this.interaction, this.keyboardStep);
        await this.keyboard.setup();
    }
}

module.exports = HangmanTaskDiscord;