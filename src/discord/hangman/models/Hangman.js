const SecretWord = require("./SecretWord");

class Hangman  {
    secretWord;

    totalHearts;
    heartsLeft;

    allAttempts;
    lettersStatuses;

    constructor(secret, hint, secretWord) {
        if (secretWord === undefined) {
            this.secretWord = new SecretWord(secret, hint);
        } else  {
            this.secretWord = secretWord;
        }

        this.setup();
    }

    setup()  {
        this.allAttempts = [];
        this.lettersStatuses = [...this.secretWord.word].map((x) => false);

        this.totalHearts = 7;
        this.heartsLeft = this.totalHearts;
    }

    hang(letter)  {
        if (this.isDuplicateLetter(letter))  {
            return false;
        }

        this.allAttempts.push(letter);

        if (this.isCorrectLetter(letter))  {
            this.updateLetterStatuses(letter);
            return true;
        }

        // not correct letter
        this.heartsLeft--;
        return false;
    }

    // determine if there are any unsolved letters left
    isGuessed()  {
        return !this.lettersStatuses.some((status) =>  {
            // returns true if there is at least one false status
            return !status;
        });
    }

    getWordWithHiddenLetters()  {
        let s = " ";

        [...this.secretWord.word].forEach((letter, index) =>  {
           if (index !== 0)  {
               s += " ";
           }

           if (this.lettersStatuses[index])  {
               s += letter;
           } else  {
               s += "_";
           }
        });

        return s + " ";
    }

    getWordWithRevealedLetters()  {
        let s = " ";

        [...this.secretWord.word].forEach((letter, index) =>  {
            if (index !== 0)  {
                s += " ";
            }

            s += letter;
        });

        return s + " ";
    }

    updateLetterStatuses(letter)  {
        /*
         mark all letters that have not been guessed yet
         but are equal to the message letter as solved,
         by pushing their index to the indexes array
         */

        [...this.secretWord.word].forEach((x, i) =>
            (!this.lettersStatuses[i] && x === letter ? this.lettersStatuses[i] = true : 'pass'));
    }

    isCorrectLetter(letter)  {
        return this.secretWord.word.includes(letter);
    }

    isDuplicateLetter(letter)  {
        if (this.allAttempts.findIndex((x) => x === letter) >= 0) {
            return true;
        }

        return false;
    }

    hasHeartsLeft()  {
        return this.heartsLeft > 0;
    }
}

module.exports = Hangman;