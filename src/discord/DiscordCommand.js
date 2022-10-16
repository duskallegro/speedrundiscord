class DiscordCommand  {
    /**
     * A Discord interaction.
     *
     * Is passed down to other objects
     * a command may use.
     */
    interaction;
    client;

    /**
     * By default a command with the given
     * text is not found.
     *
     * @param commandText command text, without prefix.
     * @param message Discord message.
     *
     * @returns {boolean} true if the command was found
     * and executed, false otherwise.
     */
    executeMessageEvent(commandText, message)  {
        return this.actionMessageEvent(commandText, message);
    }

    executeButtonEvent(buttonInteraction)  {
        return this.actionButtonEvent(buttonInteraction);
    }

    executeModalEvent(modalInteraction)  {
        return this.actionModalEvent(modalInteraction);
    }

    // default methods

    actionModalEvent(modalInteraction)  {

    }

    /**
     * By default a command with the given
     * text is not found.
     *
     * @param commandText command text, without prefix.
     * @param interaction interaction.
     *
     * @returns {boolean} true if the command was found
     * and executed, false otherwise.
     */
    async action(commandText, interaction)  {
        return false;
    }

    setup()  {

    }
}

module.exports = DiscordCommand;