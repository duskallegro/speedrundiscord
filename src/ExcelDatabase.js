const {token, prefix, VOCAB_FILE_NAME, VOCAB_SHEET_NAME} =
    require("../config");

const MemriseWord = require('../src/discord/memrise/MemriseWord');

class ExcelDatabase   {
    getVocabFromExcelFile = async () =>  {
      let vocab = await this.getRawVocabFromExcelFile();
      let final = await this.splitIntoLevels(vocab);
      let superFinal = await this.convertToMemriseWords(final);

      return superFinal;
    };

    getRawVocabFromExcelFile = async () => {
        const reader = require("xlsx");

        let file = reader.readFile("" + VOCAB_FILE_NAME);

        const sheet = file.Sheets[VOCAB_SHEET_NAME];

        const data = reader.utils.sheet_to_json(sheet);

        return data;
    };

    convertToMemriseWords = (vocab) =>  {
        let result = [];

        Object.entries(vocab).forEach((entry) =>  {
            let level = entry[0];
            let wordsInLevel = entry[1];

            result[level] = [];

            wordsInLevel.forEach((word) => {
               result[level].push(new MemriseWord(word.id, word['Foreign Word'], word['Translation'], word.level));
           });
        });

        return result;
    }

    splitIntoLevels = (vocab) => {
        const result = {};

        for (let i = 0; i < vocab.length; i++) {
            let v = vocab[i];

            if (!result.hasOwnProperty(v.level)) {
                result[v.level] = [];
            }

            result[v.level].push(v);
        }

        return result;
    };
}

module.exports = ExcelDatabase;

/*
(async () => {
    let excel = new ExcelDatabase();
    let stuff = await excel.getVocabFromExcelFile();
    console.log(stuff);
})().catch(console.error);*/
