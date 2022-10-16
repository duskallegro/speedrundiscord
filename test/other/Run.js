const HangmanCommandDiscord = require('../../src/discord/hangman/commands/HangmanCommandDiscord');
const HelpCommand = require('../../src/discord/help/HelpCommand');
const WordPadCommandDiscord = require('../../src/discord/wordpad/commands/WordPadCommandDiscord');

// new HangmanCommandDiscord(), new HelpCommand(), new WordPadCommandDiscord()
let stuff = [1, 2, 3];
stuff.some(async (s) =>  {
   console.log(s);
   return false;
});