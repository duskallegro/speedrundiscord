const axios = require('axios')
const jsdom = require("jsdom");
const reader = require("xlsx");
const MemriseWord = require('./MemriseWord')

class MemriseReader  {
    VOCAB_FILE_NAME = "most-common-words-final-new.xlsx";
    VOCAB_SHEET_NAME = "words";

    FIRST_LEVEL = 1;
    LAST_LEVEL = 50;

    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    downloadAllLevels = async () => {
        const finalVocab = [];

        await (async () => {
            for (let level = this.FIRST_LEVEL; level <= this.LAST_LEVEL; level++) {
                console.log("Saving level " + level + "...");

                let vocab = await this.getVocabularyFromMemrise(level);

                for (let i = 0; i < vocab.length; i++) {
                    finalVocab.push(vocab[i]);
                }

                //  await sleep(10_000);
            }
        })();

        console.log("finished saving levels...");
        console.log("Saved words: " + finalVocab.length);

        finalVocab.sort((a, b) => (a.id - b.id));

        return finalVocab;
    }

    getVocabularyFromMemriseUrl = async (url) => {
        let response = await axios.get(url);
        let result = this.parseVocabUrlResponse(response);

        (await result).forEach((word) =>
            word.url = url);

        return result;
    };

    getVocabularyFromMemrise = async (level) => {
        let link = 'https://app.memrise.com/course/203799/5000-most-frequent-spanish-words/' + level + "/";
        let response = await axios.get(link);

        //console.log(response);
        let memriseWordsArray = await this.parseVocabUrlResponse(response);

        memriseWordsArray.forEach((word) => {
            word.level = level
            word.link = link;
        });

        return memriseWordsArray;
    };

    // returns an array of MemriseWord
    parseVocabUrlResponse = async (response, level) => {
        let virtualDocument = new jsdom.JSDOM(response.data).window.document;

        if (level === undefined) {
            let levelNameDivs = virtualDocument.getElementsByClassName("level-number");
            let levelNumber = parseInt(levelNameDivs[0].innerHTML.trim().replace("Level ", ""));
            level = levelNumber;
        }


        let title = virtualDocument.title;  // Stack Overflow - Where Developers Learn, Share, & Build Careers
        let things = virtualDocument.querySelectorAll(".thing.text-text");
        let moreThings = virtualDocument.getElementsByClassName("text-text");

        /*  console.log(title);
          console.log(things);  // NodeList {}
          console.log(moreThings);  // NodeList {}

          console.log("printing things..." + things.length);
          console.log(things[0]);
          console.log(things[0].innerText);*/

        let vocab = [];

        let startId = level <= 1 ? 1 : (level - 1) * 100 + 1;
        for (let thing of things) {
            // foreign word

            let foreignWordElement = thing.querySelectorAll(".col_a.col.text");

            let foreignWordText = foreignWordElement[0].querySelectorAll(".text");
            //console.log("foreignWordText.length = " + foreignWordText.length);

            let foreignWord = foreignWordText[0].innerHTML;

            // translation

            let translationElement = thing.querySelectorAll(".col_b.col.text");
            let translationText = translationElement[0].querySelectorAll(".text");
            let translation = translationText[0].innerHTML;

            //  console.log(foreignWord + " = " + translation);

            /*vocab.push({
                "id": startId++,
                "foreign_word": foreignWord,
                "translation": translation,
                "level": level
            })*/

            vocab.push(new MemriseWord(startId++, foreignWord, translation, level));
        }

        return vocab;
    };

    writeVocabToExcel = async (vocab) => {
        let file;
        try {
            file = reader.readFile("./" + this.VOCAB_FILE_NAME);
        } catch (error) {
            console.log("creating it...");

            console.log(error);

            file = reader.utils.book_new();
            file.Props = {
                Title: "test",
                Subject: "Test subject",
                Author: "Red Stapler",
                CreatedDate: new Date(2017, 12, 19)
            };
            file.SheetNames.push(this.VOCAB_SHEET_NAME);
            reader.writeFile(file, './' + this.VOCAB_FILE_NAME);

            file = reader.readFile("./" + this.VOCAB_FILE_NAME);
        }

        let worksheets = file.Sheets;

        var ws = reader.utils.sheet_add_aoa(worksheets[this.VOCAB_SHEET_NAME],
            [
                ["id", "Foreign Word", "Translation", "level"]
            ],
            {origin: 0}
        );

        let rowsToWrite = [];
        for (let i = 0; i < vocab.length; i++) {
            rowsToWrite.push([vocab[i].id, vocab[i]["foreign_word"], vocab[i].translation, vocab[i].level]);
        }

        console.log("rowsToWrite: " + rowsToWrite);
        reader.utils.sheet_add_aoa(worksheets[this.VOCAB_SHEET_NAME],
            rowsToWrite,
            {origin: -1});

        //reader.utils.book_append_sheet(file,ws,"vocab");

        reader.writeFile(file, './' + this.VOCAB_FILE_NAME);

    };

}

module.exports = MemriseReader;