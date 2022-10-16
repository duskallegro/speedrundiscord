const axios = require('axios')
const jsdom = require("jsdom");

const fs = require('fs');

const replace = (original, oldString, newString) => {
    let index = original.indexOf(oldString);
    do {
        original = original.replace(oldString, newString);
        index = original.indexOf(oldString);
    } while (index > 0);

    return original;
}


const parseJsonAnkiCards = (jsonString, result) => {
    let jsonObject = JSON.parse(jsonString);

    if (jsonObject["__type__"] === "Deck") {
        let notes = jsonObject.notes;

        // add notes if exist
        if (notes !== undefined && notes.length > 0) {
            //let notesArray = [];
            // notes.forEach((note) => notesArray.push(note));
            //result.push(notesArray);
            notes.forEach((note) => {
                let foreignWords = [];

                let smallNotes = note.fields.slice(2);
                let sounds = smallNotes.filter((e) => {
                    return e.includes("[sound:")
                });
                sounds = sounds.map((sound) => (sound.trim()));

                let pictures = smallNotes.filter((n) => n.includes("<img") &&
                    n.includes(".jpg"));

                let notEmpty = note.fields.slice(1).filter((n) => {
                    n = n.trim();
                    return n !== "" && !sounds.includes(n) && !pictures.includes(n);
                });
                let translations = notEmpty;

                smallNotes = smallNotes.filter((n) => {
                    let isGood = true;

                    for (let i = 0; i < translations.length; i++) {
                        let t = translations[i];

                        if (t === n) {
                            isGood = false;
                            break;
                        }
                    }

                    return isGood;
                });

                sounds = sounds.map((sound) => {
                    sound = sound.trim();
                    return sound.substring("[sound:".length, sound.length - 1);
                });

                smallNotes = smallNotes.filter((n) => (n.trim() !== "" &&
                    !n.trim().startsWith("[sound:")));
                smallNotes = smallNotes.map((n) => (n.trim()));
                smallNotes = smallNotes.filter((n) => !n.includes("<img") &&
                    !n.includes(".jpg"));

                let first = note.fields[0];
                let firstData = first.split("<br>");
                let secondData = first.split("/");
                let thirdData = first.split("\\");

                if (firstData.length < 1 && secondData.length > 1) {
                    firstData = secondData;
                }
                if (firstData.length < 1 && thirdData.length > 1) {
                    firstData = thirdData;
                }

                if (firstData.length !== 0) {
                    note.fields.splice(0, 1);
                    firstData.forEach((d, i) => {
                        foreignWords.push(d.trim());
                    });
                }

                note.fields.forEach((f, i) => note.fields[i] = f.trim());
                result.push({
                    "foreign_words": foreignWords,
                    "translations": translations,
                    "notes": smallNotes,
                    "sounds": sounds,
                    "pictures": pictures
                });
            });
        }

        // check children
        if (jsonObject.children !== undefined ||
            jsonObject.children.length > 0) {
            jsonObject.children.forEach((child) =>
                parseJsonAnkiCards(JSON.stringify(child), result));
        }
    } else {
        console.log("Not a Deck!");
        console.log(jsonObject["__type__"]);
    }
}

// TODO: add sound, add picture, add multiple FW


//parseAnkiCards();
let jsonString = fs.readFileSync('./spanish-sentences-export.json');
//let jsonString = fs.readFileSync('./100-english.json');
let result = [];
parseJsonAnkiCards(jsonString, result);
console.log(result.length);

result.forEach((r) => {
    if (r.sounds.length > 0) {
        console.log(r.sounds);
    }
})


/*

const parseAnkiCards = () =>  {
    let data = fs.readFileSync('./spanish-sentences-export-small.txt');
    data = data.toString('utf8', 0, data.length);

    data = replace(data, "\"\"center\"\"", "\"center\"");
    data = replace(data, "\"\"answer\"\"", "\"answer\"");

    console.log(data);

    let virtualDocument = new jsdom.JSDOM(data).window.document;


    console.log(virtualDocument.innerText);

    let questionsDivs = virtualDocument.querySelectorAll(".center");
    let answersDivs = virtualDocument.querySelectorAll(".answer");

    console.log(questionsDivs);

    console.log(questionsDivs.length);

    questionsDivs.forEach((div) => console.log(div.innerHTML));

    console.log("answers:");
    answersDivs.forEach((div) => console.log(div.innerHTML));

};*/
