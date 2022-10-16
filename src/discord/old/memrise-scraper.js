const axios = require('axios')
const jsdom = require("jsdom");
const reader = require("xlsx");

const VOCAB_FILE_NAME = "most-common-words-final-new.xlsx";
const VOCAB_SHEET_NAME = "words";

const FIRST_LEVEL = 1;
const LAST_LEVEL = 50;

// helper methods

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const downloadAllLevels = async () => {
    const finalVocab = [];

    await (async () => {
        for (let level = FIRST_LEVEL; level <= LAST_LEVEL; level++) {
            console.log("Saving level " + level + "...");

            let vocab = await getVocabularyFromMemrise(level);

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

const getVocabularyFromMemriseUrl = async (url) => {
    let response = await axios.get(url);
    let result = parseVocabUrlResponse(response);

    (await result).forEach((word) =>
        word.url = url);

    return result;
};

const getVocabularyFromMemrise = async (level) => {
    let response = await axios.get('https://app.memrise.com/course/203799/5000-most-frequent-spanish-words/' + level + "/");

    //console.log(response);
    let result = await parseVocabUrlResponse(response);

    result.forEach((word) => {
        word.level = level
    });
};

const parseVocabUrlResponse = async (response, level) => {
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

        vocab.push({
            "id": startId++,
            "foreign_word": foreignWord,
            "translation": translation,
            "level": level
        })
    }

    return vocab;
};

const writeVocabToExcel = async (vocab) => {
    let file;
    try {
        file = reader.readFile("./" + VOCAB_FILE_NAME);
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
        file.SheetNames.push(VOCAB_SHEET_NAME);
        reader.writeFile(file, './' + VOCAB_FILE_NAME);

        file = reader.readFile("./" + VOCAB_FILE_NAME);
    }

    let worksheets = file.Sheets;

    var ws = reader.utils.sheet_add_aoa(worksheets[VOCAB_SHEET_NAME],
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
    reader.utils.sheet_add_aoa(worksheets[VOCAB_SHEET_NAME],
        rowsToWrite,
        {origin: -1});

    //reader.utils.book_append_sheet(file,ws,"vocab");

    reader.writeFile(file, './' + VOCAB_FILE_NAME);

};


// main method

(async () => {
    /*    const vocab = await getVocabularyFromMemrise(1);

        // console.log("Total words: " + vocab.length);
        // console.log(vocab);

        await writeVocabToExcel(vocab);*/

    // const finalVocab = await downloadAllLevels();
    //await writeVocabToExcel(finalVocab);

    //  const vocab = await getVocabularyFromMemriseUrl("https://app.memrise.com/course/203799/5000-most-frequent-spanish-words/3/");
    // console.log(vocab);
})().catch(console.error);

/*
let file;
    try  {
        file = reader.readFile("./test.xlsx");
    }
    catch (error)  {
        console.log("creating it...");

        console.log(error);

        file = reader.utils.book_new();
        file.Props = {
            Title: "test",
            Subject: "Test subject",
            Author: "Red Stapler",
            CreatedDate: new Date(2017,12,19)
        };
        file.SheetNames.push("vocab");

    }

    let student_data = [{
        Student:'Dog',
        Age:22,
        Branch:'ISE',
        Marks: 70
    },
        {
            Student:'Cat',
            Age:21,
            Branch:'EC',
            Marks:80
        }]


    let worksheets = file.Sheets;

    const ws = reader.utils.sheet_add_aoa(worksheets["vocab"],
        [["bad boy", 22, "stuff", 1], ["good boy", 12, "ree", 1], ["sup", 1, "ew", 1]],
        {origin: -1});

    //reader.utils.book_append_sheet(file,ws,"vocab");

    reader.writeFile(file,'./test.xlsx');

 */


module.exports = {
    downloadAllLevels, getVocabularyFromMemriseUrl, getVocabularyFromMemrise, writeVocabToExcel
};


//export  {getVocabularyFromMemriseUrl};