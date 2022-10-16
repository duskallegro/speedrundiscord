let {makeComplexCommand, makeSimpleCommand} = require('./command.js');

let {randomInRange} = require("./util.js");
let {prefix, currentMaxLevel} = require("../../../config");

let diceCommand = makeComplexCommand();

let currentVocabSecret = null;
let isForeignSecret = false;

diceCommand["name"] = "dice";
diceCommand["description"] = "Rolls the dice for the next word";

diceCommand["commands"]["dice"] = makeSimpleCommand("dice",
    "Pick a random word to guess",

        function (interaction) {
                    // remove command prefix
                    let message = interaction.content
                            .substring(prefix.length).trim(); // remove edge spaces

                    // remove command name
                    message = message.replace("dice", "");

                    // get level if there is one
                    let level = parseInt(message);

                    let vocabDice = null;
                    // if there is no level specified
                    if (isNaN(level)) {
                        //  let dice = diceThrow(vocab);
                        // the level will be random
                        let randomLevel = randomInRange(1, currentMaxLevel);
                        console.log("random level: " + randomLevel);

                        // contains all levels and their respective words
                        let splitVocab = diceCommand["splitVocab"];

                        // contains 100 words from a single random level
                        let vocabPart = splitVocab[randomLevel];

                        // contains the index of the selected random word
                        let dice = diceThrow(vocabPart);

                        // gets the random wordpair itself
                        vocabDice = vocabPart[dice];
                        console.log(vocabDice);
                    } else {
                        let dice = diceThrow(diceCommand["splitVocab"][level]);
                        vocabDice = diceCommand["splitVocab"][level][dice];
                    }

                    currentVocabSecret = vocabDice;
                    isForeignSecret = false;
                    interaction.channel.send("**Level: " + vocabDice.level + "**\n`" +
                        vocabDice["Foreign Word"] + " = ?`");
        });


diceCommand["commands"]["guess"] = makeSimpleCommand("guess", "Guess the word",
        function (interaction) {
                    if (currentVocabSecret == null) {
                        interaction.reply("**No secret word yet!**");
                        return;
                    }

                    let message = interaction.content;
                    message = message.substr(prefix.length + "guess".length).trim();

                    if (message === "idk")  {
                        interaction.reply(printedSecretWord());
                        currentVocabSecret = null;
                        return;
                    }

                    if (!isForeignSecret && message === currentVocabSecret["Translation"]) {
                        interaction.reply("**You guessed correctly!**");
                        interaction.reply(printedSecretWord());
                        currentVocabSecret = null;
                    } else if (!isForeignSecret) {
                        // check several translations
                        let translactions = currentVocabSecret["Translation"].split(",");
                        translactions.forEach((t, i) => translactions[i] = t.trim());

                        let allTranslactions = [];
                        for (let i = 0; i < translactions.length; i++) {
                            let translationsSpace = translactions[i].split(" ");
                            translationsSpace.forEach(e => allTranslactions.push(e));
                        }

                        for (let i = 0; i < allTranslactions.length; i++) {
                            if (allTranslactions[i] === message) {
                                interaction.reply("**You guessed correctly!**");
                                interaction.reply(printedSecretWord());
                                currentVocabSecret = null;
                                return;
                            }
                        }

                        interaction.reply("**Wrong guess!**");
                    } else if (isForeignSecret && message === currentVocabSecret["Foreign Word"]) {
                        interaction.reply("**You guessed correctly!**");
                        interaction.reply(printedSecretWord());
                        currentVocabSecret = null;
                    } else {
                        interaction.reply("**Wrong guess!**");
                    }
    });

diceCommand.action = diceCommand.commands.dice.action;


const diceThrow = (array) => (Math.floor(Math.random() * array.length));

const printedSecretWord = () => {
    return "__Secret word__\n" +
        "**Level " + currentVocabSecret.level + "**\n" +
        "`" +
        currentVocabSecret["Foreign Word"] + " = " + currentVocabSecret["Translation"] +
        "`";
};



module.exports = {diceCommand, diceThrow};

