const SecretWord = require('./SecretWord');

class MemriseSecretWord extends SecretWord  {
    memriseWord;

    constructor(memriseWord) {
        super(memriseWord.foreignWord,
                memriseWord.translation);
        this.memriseWord = memriseWord;
    }

    isMemriseWord()  {
        return true;
    }

    getLevel()  {
        return this.memriseWord.level;
    }
}

module.exports = MemriseSecretWord;