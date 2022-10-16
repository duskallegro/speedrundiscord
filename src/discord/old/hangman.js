const {ButtonBuilder} = require("@discordjs/builders");
const {EmbedBuilder} = require("@discordjs/builders");
const {emojiToolkit} = require("./EmojiToolkit.js");
const {ActionRowBuilder, SelectMenuBuilder} = require('discord.js');

let currentHangmanSecret = null;
let currentHangmanTranslation = null;
let hangmanAttempts = [];
let countAttempts = 0;
let allAttempts = [];
let currentEmbed = null;
let currentEmbedMessage = null;
let currentKeyboardRemained = null;

let gameOn = false;
let isWorking = false;

const MAX_HANGMAN_ATTEMPTS = 7;

const resetHangman = () => {
    currentHangmanSecret = null;
    hangmanAttempts = [];
    countAttempts = 0;
    allAttempts = [];
    currentEmbed = null;
    currentEmbedMessage = null;
    currentHangmanTranslation = null;
    currentKeyboardRemained = null;

    gameOn = false;
    isWorking = false;
}

const {makeSimpleCommand, makeComplexCommand} = require("./command.js");
const {randomInRange} = require("./util.js");

let hangCommand = makeComplexCommand();
const {diceThrow} = require("./dice.js");
let {prefix, currentMaxLevel} = require("../../../config");

hangCommand["name"] = "hangman";
hangCommand["description"] = "Play Hangman game";

hangCommand.chooser = function(commandName, interaction)  {
    let action = hangCommand.commands[commandName];
    if (action === undefined || action === null)  {
        return false;
    }

    if (isWorking)  {
        return false;
    }

    isWorking = true;
    action.action(interaction);
    isWorking = false;
}

hangCommand.commands = {
    "hangman": makeSimpleCommand("hangman", "Create a new word for Hangman",
        async function (interaction) {
            gameOn = true;
            isWorking = true;

            try {
                interaction.deferUpdate();
            } catch (e) {
                console.log(e);
            }

            try {
                if (currentEmbedMessage !== null && currentEmbedMessage !== undefined) {
                    currentEmbedMessage.embeds[0].description = getValidDescription('🙅');
                    currentEmbedMessage.edit({embeds: [currentEmbedMessage.embeds[0]]});

                    await disableAllButtons(interaction);

                }
            } catch (e) {
                console.log(e);
            }

            let randomLevel = randomInRange(1, currentMaxLevel);

            let splitVocab = hangCommand["splitVocab"];
            let vocabPart = splitVocab[randomLevel];
            let wordIndex = diceThrow(splitVocab[randomLevel]);

            currentHangmanSecret = vocabPart[wordIndex];

            hangmanAttempts = [...currentHangmanSecret["Foreign Word"]]
                .map((x) => false);
            countAttempts = 0;
            allAttempts = [];

            console.log("current hangman: " + currentHangmanSecret["Foreign Word"]);

            let embedData = createHangmanEmbed();
            console.log(embedData[0].data);
            console.log(embedData[1].data);
            console.log(embedData[2].data);

            // send main embed
            let result = await interaction.channel.send({
                embeds: [embedData[0].data],
                "components": [
                    {
                        "type": 1,
                        "components": [
                            // buttons
                            {
                                "style": 1,
                                "label": `New Word`,
                                "custom_id": `new_word_button`,
                                "disabled": false,
                                "type": 2
                            },
                            {
                                "style": 4,
                                "label": `Surrender`,
                                "custom_id": `surrender_button`,
                                "disabled": false,
                                "type": 2
                            },
                        ]
                    },

                    // letters
                    {
                        "type": 1,
                        "components": createLettersButtons("A", "D")
                    },

                    {
                        "type": 1,
                        "components": createLettersButtons("E", "H")
                    },

                    {
                        "type": 1,
                        "components": createLettersButtons("I", "L")
                    },

                    {
                        "type": 1,
                        "components": createLettersButtons("M", "P")
                    },

                    /*{
                        "type": 1,
                        components: [
                            // dropdown menu
                            {
                                "custom_id": `lettersHalfMenu`,
                                "placeholder": `Select a letter A-M`,
                                "options": createLettersDropdown("A", "X"),/!*[
                                    {
                                        "label": `A-M`,
                                        "value": `am`,
                                        "description": `Select a letter from A to M`,
                                        "default": false
                                    },
                                    {
                                        "label": `N-Z`,
                                        "value": `nz`,
                                        "description": `Select a letter from N to Z`,
                                        "default": false
                                    },

                                ],*!/
                                "min_values": null,
                                "max_values": null,
                                "type": 3
                            }
                        ]
                    }*/
                ],
            });
            currentEmbed = embedData[0].data;
            currentEmbedMessage = result;

            // send keyboard remainder
            result = await interaction.channel.send({
                embeds: [],
                "components": [
                    {
                        "type": 1,
                        "components": createLettersButtons("Q", "T")
                    },
                    {
                        "type": 1,
                        "components": createLettersButtons("U", "X")
                    },

                    {
                        "type": 1,
                        "components": createLettersButtons("Y", "Z")
                    }
                ]
            });
            currentKeyboardRemained = result;

            // send letter reactions

            /* let lettersEmbed = createLettersEmbed("A-M", "Choose letters from A to M");
             lettersEmbed.setId = 'dog';
             result = await interaction.channel.send({embeds: [lettersEmbed.data]});
             let letters = emojiToolkit.getLettersEmojisInRange("A", "M");
             addLettersReactions(letters, result);

             lettersEmbed = createLettersEmbed("N-Z", "Choose letters from N to Z");
             result = await interaction.channel.send({embeds: [lettersEmbed.data]});
             letters = emojiToolkit.getLettersEmojisInRange("N", "Z");
             addLettersReactions(letters, result);*/

            isWorking = false;

        }),
    "hang": makeSimpleCommand("hang", "Try to guess a Hangman letter",
        async function (emojiName, interaction, user) {
            isWorking = true;

            if (!gameOn) {
                console.log("Can't hang, game is over!");
                isWorking = false;
                return;
            }

            await interaction.deferUpdate();

            let message = emojiName.toLowerCase();

            let processInput = hangCommand.commands.processLetter.action(message);

            if (processInput === PROCESS_RESULT.CORRECT_LETTER) {
                let m = interaction.message;
                // m.reactions.removeAll();

                // let users = interaction.message.reactions.resolve(interaction).users;
                // users.removeAll();
                // users.remove(user);

                interaction.component.style = "SUCCESS";
            } else if (processInput === PROCESS_RESULT.WRONG_LETTER ||
                processInput === PROCESS_RESULT.DUPLICATE_LETTER) {
                interaction.component.style = "DANGER";
            } else if (processInput === PROCESS_RESULT.SURRENDER_INPUT) {
                hangCommand.commands.surrender.action(interaction);
                isWorking = false;
                return;
            }


            interaction.component.disabled = true;
            let allComponents = interaction.message.components;
            await interaction.editReply({components: allComponents});

            currentEmbedMessage.embeds[0].fields[2] = getValidAttemptsField();
            currentEmbedMessage.embeds[0].fields[3] = getValidHeartsField();

            currentEmbedMessage.embeds[0].description =
                "`" + showHangmanWord() + "`" +
                "\n\nHint: " + "||" + currentHangmanSecret["Translation"] + "||";
            currentEmbedMessage.edit({embeds: [currentEmbedMessage.embeds[0]]});

            console.log(processInput);

            if (isAllWordGuessed()) {
                // interaction.message.reply({content: "You guessed the word!"});

                currentEmbedMessage.embeds[0].description = getValidDescription('✅');
                currentEmbedMessage.edit({embeds: [currentEmbedMessage.embeds[0]]});

                await disableAllButtons(interaction);

                resetHangman();
            } else if (countAttempts >= MAX_HANGMAN_ATTEMPTS) {
                //interaction.message.reply({content: "Game over, you tried!"});

                currentEmbedMessage.embeds[0].description =
                    getValidDescription('❌');
                currentEmbedMessage.edit({embeds: [currentEmbedMessage.embeds[0]]});

                await disableAllButtons(interaction);

                resetHangman();
            }

            isWorking = false;
        }),
    "processLetter": makeSimpleCommand("processLetter", "Process Letter",
        function (letter) {
            // if empty arguments, generate new word
            if (letter === "" && currentHangmanSecret === null) {
                // hangCommand.commands.hangman.action(interaction);
                return PROCESS_RESULT.INVALID_INPUT;
            }

            if (currentHangmanSecret === null) {
                // interaction.reply("No Hangman secret!");
                return PROCESS_RESULT.INVALID_INPUT;
            }

            // surrender
            if (letter === "" || letter === 'idk') {
                // interaction.reply("**Level " + currentHangmanSecret.level + "**\n" +
                //   "`" + currentHangmanSecret["Foreign Word"] + "`");
                return PROCESS_RESULT.SURRENDER_INPUT;
            }

            if (letter.length !== 1) {
                return PROCESS_RESULT.INVALID_INPUT;
            }

            // if message length is 1

            let indexes = [];

            if (allAttempts.findIndex((x) => x === letter) >= 0) {
                // interaction.reply("**You have already guessed that letter!**");
                return PROCESS_RESULT.DUPLICATE_LETTER;
            }

            allAttempts.push(letter);

            /*
             mark all letters that have not been guessed yet
             but are equal to the message letter as solved,
             by pushing their index to the indexes array
             */

            [...currentHangmanSecret["Foreign Word"]].forEach((x, i) =>
                (!hangmanAttempts[i] && x === letter ? indexes.push(i) : 'pass'));

            let correct = false;
            indexes.forEach((index) => {
                if (index >= 0) {
                    correct = true;
                    // mark letter as solved
                    hangmanAttempts[index] = true;
                }
            });

            // determine if any letters were marked as solved
            let answerIsCorrect = !(indexes.length === 0 || !correct);

            // show the word to the user
            // interaction.reply(showHangmanAnswer(answerIsCorrect, allWordIsDone));

            if (!answerIsCorrect) {
                countAttempts++;
            }
            return answerIsCorrect ? PROCESS_RESULT.CORRECT_LETTER : PROCESS_RESULT.WRONG_LETTER;
        }),
    "surrender": makeSimpleCommand("surrender", "Surrender",
        async function (interaction) {
            isWorking = true;

            interaction.deferUpdate();
            // interaction.reply({content: "`" + currentHangmanSecret["Foreign Word"] + "`"});

            currentEmbedMessage.embeds[0].description = getValidDescription('🏳️');
            currentEmbedMessage.edit({embeds: [currentEmbedMessage.embeds[0]]});
            await disableAllButtons(interaction);
            resetHangman();

            isWorking = false;
        })
};

const disableAllButtons = async (interaction) => {
    if (!gameOn) {
        console.log("Can't disable keyboard, game is over!");
        return;
    }

    isWorking = true;

    let firstKeyboardPart = currentEmbedMessage.components;
    let secondKeyboardPart = currentKeyboardRemained.components;

    let allComponents = firstKeyboardPart.concat(secondKeyboardPart);
    allComponents.forEach(row => {
        let rowComponents = row.components;

        rowComponents.forEach(button => {
            if (button.type === "BUTTON" && button.customId !== "new_word_button") {
                button.disabled = true;
            }
        });
    });

    // await interaction.editReply({components: firstKeyboardPart});

    // update method is not a function
    await currentEmbedMessage.edit({components: firstKeyboardPart});
    await currentKeyboardRemained.edit({components: secondKeyboardPart});

    isWorking = false;
}

const PROCESS_RESULT = {
    INVALID_INPUT: "INVALID_INPUT",
    DUPLICATE_LETTER: "DUPLICATE_LETTER",
    WRONG_LETTER: "WRONG_LETTER",
    CORRECT_LETTER: "CORRECT_LETTER",
    SURRENDER_INPUT: "SURRENDER_INPUT",
}


const isAllWordGuessed = () => {
    // determine if there are any unsolved letters left
    let countSuccesses = 0;
    hangmanAttempts.forEach((a) => {
        if (a) {
            countSuccesses++;
        }
    });

    // determine if the whole word was guessed
    return countSuccesses >= currentHangmanSecret["Foreign Word"].length;
}

hangCommand.action = hangCommand.commands.hang.action;

const getGuessedLetters = () => {
    let result = [];

    [...currentHangmanSecret["Foreign Word"]].forEach((x, i) =>
        (hangmanAttempts[i] && !result.includes(x) ? result.push(x) : 'pass'));

    return result;
};

const getFreeLetters = () => {
    let result = [];

    [...currentHangmanSecret["Foreign Word"]].forEach((x, i) =>
        (!hangmanAttempts[i] && !result.includes(x) ? result.push(x) : 'pass'));

    return result;
};

const showHangmanAnswer = (correctGuess, allWordIsDone) => {
    let answer = "";

    if (correctGuess) {
        answer += "**You guessed correctly!**\n\n";
    } else {
        answer += "**Wrong guess!**\n";
        countAttempts++;
    }

    answer += "**Level " + currentHangmanSecret.level + "**\n" +
        "\n`" + showHangmanWord() + "`" +
        `\n\n**Attempts: ${MAX_HANGMAN_ATTEMPTS - countAttempts}/${MAX_HANGMAN_ATTEMPTS}**`;

    if (allWordIsDone) {
        answer += "\n\n**You guessed the word!**";
        resetHangman();
    }

    return answer;
}

const showHangmanWord = () => {
    let s = " ";

    for (let i = 0; i < hangmanAttempts.length; i++) {
        if (i !== 0) {
            s += " ";
        }

        if (hangmanAttempts[i]) {
            s += currentHangmanSecret["Foreign Word"][i];
        } else {
            s += "_";
        }
    }

    return s + " ";
}

const secretToHangmanHide = (secret) => {
    let s = " ";

    for (let i = 0; i < secret.length; i++) {
        if (i !== 0) {
            s += " ";
        }

        s += "_";
    }

    return s + " ";
}

const showFullHangmanWord = () => {
    let s = " ";

    for (let i = 0; i < currentHangmanSecret['Foreign Word'].length; i++) {
        if (i !== 0) {
            s += " ";
        }

        s += currentHangmanSecret["Foreign Word"][i];
    }

    return s + " ";
}

const createLettersEmbed = (title, description) => {
    const result = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(title)
        .setDescription(description)
        .setTimestamp()
        .setFooter({
            text: 'speedun spanish',
            iconURL: 'https://i.pinimg.com/originals/c5/c2/1c/c5c21cf1354295ccc2ae79f70d28afa4.png'
        });

    return result;
};

const createHangmanEmbed = () => {
    let word = secretToHangmanHide(currentHangmanSecret["Foreign Word"]);
    let guessedLetters = getGuessedLetters();
    const result = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Hangman Game')
        // .setURL('https://discord.js.org/')
        .setDescription("`" + secretToHangmanHide(currentHangmanSecret["Foreign Word"]) + "`" +
            "\n\nHint: " + "||" + currentHangmanSecret["Translation"] + "||")
        // .setThumbnail('https://i.imgur.com/AfFp7pu.png')
        .setThumbnail('https://images-na.ssl-images-amazon.com/images/I/41Kt59CjXmL.png')
        .setTimestamp()

        .addFields({name: 'Source', value: 'Memrise', inline: true},
            {name: 'Level', value: `${currentHangmanSecret.level}`, inline: true},
            getValidAttemptsField(),
            getValidHeartsField())

        .setFooter({
            text: 'speedun spanish',
            iconURL: 'https://i.pinimg.com/originals/c5/c2/1c/c5c21cf1354295ccc2ae79f70d28afa4.png'
        });

    const newWordButton = new ButtonBuilder()
        .setCustomId("new_hangman_builder")
        .setLabel("New Word")
        .setStyle(1)
        .setDisabled(false)
    ;
    newWordButton.type = 2;
    const surrenderButton = new ButtonBuilder()
        .setCustomId("surrender_hangman_button")
        .setLabel("Surrender")
        .setStyle(4)
        .setDisabled(false)
    ;
    surrenderButton.type = 2;

    return [result, newWordButton, surrenderButton];
};

const getValidHeartsField = () => {
    let result = {name: 'Hearts', value: ''};

    let remainingAttempts = MAX_HANGMAN_ATTEMPTS - countAttempts;
    for (let i = 0; i < remainingAttempts; i++) {
        result.value += '❤ ';
    }

    if (result.value === '') {
        result.value = '☹️';
    }

    return result;
    // return     {name: "Hearts", value: '❤️❤️❤️❤️❤️❤️❤️'}
}

const getValidAttemptsField = () => {
    return {
        name: 'Attempts', value:
            ` ${MAX_HANGMAN_ATTEMPTS - countAttempts}/${MAX_HANGMAN_ATTEMPTS}`,
        inline: true
    };
}

const getValidDescription = (emoji) => {
    return "`" + showFullHangmanWord() + "` " + emoji +
        "\n\nHint: " + "`" + currentHangmanSecret["Translation"] + "`";
}

const addLettersReactions = (letters, message) => {
    letters.forEach((e) => {
        message.react(e);
    });
}

const addAllLettersReactions = (message) => {
    addLettersReactions(emojiToolkit.emojis, message);
}

const addGuessedLettersReactions = (message) => {
    let guessedLetters = getGuessedLetters();
    addLettersReactions(guessedLetters, message);
};

const createLettersDropdown = (start, end) => {
    let result = [];

    for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
        let emoji = String.fromCharCode(i);
        result.push({
            label: emoji,
            value: emoji,
            description: "Letter " + emoji,
            default: false
        });
    }

    return result;
}

const createLettersButtons = (start, end) => {
    let result = [];

    for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++) {
        let emoji = String.fromCharCode(i);
        result.push({
            "style": 2,
            "label": `${emoji}`,
            "custom_id": `${emoji}_button`,
            "disabled": false,
            "type": 2
        });
    }

    return result;
};

module.exports = {hangCommand};
