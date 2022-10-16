const DiscordCommand = require("../DiscordCommand");

class UserInformationCommand extends DiscordCommand  {
    constructor() {
        super();
    }

    async actionMessageEvent(commandText, discordId)  {
        let userId = commandText.author.id;

        switch (commandText)  {
            case "./usertag":
                await this.getUserTag(discordId);
                return true;
            default:

        }
    }

    static async getUserTag(client, discordId)  {
        const user = await client.users.fetch(discordId).catch(() => null);
        if (!user) {
            console.log("That user is not available");
        } else {
            console.log(user.tag);
            return user.tag;
        }
    }
}

module.exports = UserInformationCommand;