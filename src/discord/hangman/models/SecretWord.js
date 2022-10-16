class SecretWord  {
    word;
    hint;

    constructor(word, hint) {
        this.word = word;
        this.hint = hint;
    }

    isMemriseWord()  {
        return false;
    }
}

module.exports = SecretWord;