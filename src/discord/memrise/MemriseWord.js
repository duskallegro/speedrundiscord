class MemriseWord  {
    id;
    foreignWord;
    translation;
    level;
    link;

    constructor(id, foreign, translation, level) {
        this.id = id;
        this.foreignWord = foreign;
        this.translation = translation;
        this.level = level;
    }
}

module.exports = MemriseWord;