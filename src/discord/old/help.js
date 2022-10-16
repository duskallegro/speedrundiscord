let {makeComplexCommand, makeSimpleCommand} = require('./command.js');

let {prefix} = require('../../../config');

let helpCommand = makeComplexCommand();


helpCommand.name = "help";
helpCommand.description = "Lists all commands";

helpCommand["commands"]["help"] =  makeSimpleCommand("help", "Get help",
    async (interaction) => {
            const myMessage = await interaction.reply("__**Commands**__\n\n**" +
            `1. \`${prefix}dice\`` + " - To roll the dice, get a random secret word.\n" +
            `\nExamples:\n \`${prefix}dice\` - to get a random word from any level\n` +
            `\`${prefix}dice` + " N\` - to get a random word from level N\n" +
            `\n2. \`${prefix}guess\`` + " - To make a guess about current secret word\n" +
            `\n3. \`${prefix}idk\`` + " - To surrender and find out the secret word)**");

            // myMessage.react("\\:apple:");
            myMessage.react('😄');
     }
);

helpCommand.action = helpCommand.commands.help;

module.exports = {helpCommand};
