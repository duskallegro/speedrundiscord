const DiscordBot = require("./DiscordBot");

(async () => {
    let bot = new DiscordBot();
    bot.setup();
    console.log("done");
})().catch(console.error);
