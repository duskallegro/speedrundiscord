class WordPad  {
    word;
    translation;
    userId;

    constructor(word, translation, userId) {
        this.word = word;
        this.translation = translation;
        this.userId = userId;
    }
}

module.exports = WordPad;