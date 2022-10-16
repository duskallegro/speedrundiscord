const DiscordCommand = require('../DiscordCommand');

class HelpCommand extends DiscordCommand  {
    actionMessageEvent(commandText, message) {
        if (commandText === "help") {
            console.log("HelpCommand");
            message.reply({content: "Help!"});
            return true;
        } else  {
            return false;
        }
    }

    actionButtonEvent(buttonInteraction)  {

    }
}

module.exports = HelpCommand;