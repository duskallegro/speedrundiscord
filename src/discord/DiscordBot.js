const {Client, Intents, TextInputComponent} = require('discord.js');
const {token, prefix} = require('../../config');

const HangmanCommandDiscord = require('./hangman/commands/HangmanCommandDiscord');
const HelpCommand = require('./help/HelpCommand');
const WordPadCommandDiscord = require('./wordpad/commands/WordPadCommandDiscord');

class DiscordBot  {
    commands;

    client;

    constructor(commands) {
        if (commands === undefined)  {
            this.commands = [new HangmanCommandDiscord(),
                new HelpCommand(), new WordPadCommandDiscord()];
        } else  {
            this.commands = commands;
        }

        // this.setup();
    }

    /**
     * ButtonInteraction, ModalSubmitInteraction,
     * and Message are used. Their common parent class is Base.
     */
      setup()  {
        this.commands.forEach(async (command) =>  {
              command.setup();
        });

        try {
            this.client = new Client({
                intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS",
                    "DIRECT_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_EMOJIS_AND_STICKERS"]
            });

            this.client.once('ready', async () => {
                console.log("Ready!");
            });

            this.client.login(token);

            this.setupMessageEvent();
            this.setupInteractionEvent();

            this.commands.forEach((command) =>  {
               command.client = this.client;
            });
        } catch (e)  {
            console.log(e);
        }
    }

    /**
     * messageCreate event returns a Message object,
     * so an interaction is assumed to be a Message here
     */
    async setupMessageEvent()  {
        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) {
                return;
            }

            let messageContent = message.content;
            if (!messageContent.startsWith(prefix)) {
                return;
            }

            console.log("new message: " + messageContent);

            let commandText = messageContent.substring(prefix.length);

            for (let i = 0; i < this.commands.length; i++) {
                let command = this.commands[i];

                console.log("command: " + command);
                let res =  await command.executeMessageEvent(commandText, message);
                console.log("res: " + res);

                if (res)  {
                    break;
                }
            }

            /*this.commands.some(async (command) => {
                console.log("command: " + command);
                let res =  await command.executeMessageEvent(commandText, message);
                console.log("res: " + res);
                return res;
             });*/
        });
    }

    /**
     * A BaseInteraction object is returned -
     * could be a child class, depending on the kind
     * of interaction.
     */
    setupInteractionEvent()  {
        this.client.on("interactionCreate", async (interaction, user) =>  {
            if (interaction.isButton())  {
                this.setupButtonInteraction(interaction);
            } else if (interaction.isModalSubmit())  {
                this.setupModalInteraction(interaction);
            }
        });
    }

    async setupButtonInteraction(buttonInteraction)  {
        if (buttonInteraction.user.bot)  {
            return;
        }

        for (let i = 0; i < this.commands.length; i++) {
            let command = this.commands[i];

            if (await command.executeButtonEvent(buttonInteraction))  {
                return true;
            }
        }

        return false;
    }

    async setupModalInteraction(modalInteraction)  {
        if (modalInteraction.user.bot)  {
            return;
        }

        for (let i = 0; i < this.commands.length; i++) {
            let command = this.commands[i];

            if (await command.executeModalEvent(modalInteraction))  {
                return true;
            }
        }

        return false;
    }
}

module.exports = DiscordBot;