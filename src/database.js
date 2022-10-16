const db = require('../database-config');

const googleSpeaker = require('./GoogleSpeaker');

module.exports = {
    async getMemriseByLevel(level) {
        try {
            var query = "select * from memrise_levels where level = $1;";
            const res = await db.query(query, [level]);

            console.log("memrise by level result: " + JSON.stringify(res));
            console.log("memrise by id rows: " + JSON.stringify(res.rows[0]));

            const levelWords = [];

            for (let i = 0; i < res.length; i++) {
                var word = res.rows[i];

                var memriseWord = {
                    id: a.title,
                    "foreign_word": word["foreign_word"],
                    "translation": word.translation,
                    level: level,
                    url: word.url
                };

                levelWords.push(memriseWord);
            }

            return levelWords;
        } catch (e) {
            console.log(e);
            return null;
        }
    },

    async getMemriseByUrl(url) {
        try {
            let query = "select * from memrise_levels where url = $1;";

            const res = await db.query(query, [url]);

            // console.log("memrise by url result: " + JSON.stringify(res));
            // console.log("memrise by id rows: " + JSON.stringify(res.rows[0]));

            console.log("selected " + res.rows.length + " rows...");
            const levelWords = [];

            for (let i = 0; i < res.rows.length; i++) {
                var word = res.rows[i];

                var memriseWord = {
                    id: word.id,
                    "foreign_word": word["foreign_word"],
                    "translation": word.translation,
                    level: word.level,
                    url: url
                };

                levelWords.push(memriseWord);
            }

            return levelWords;
        } catch (e) {
            console.log(e);
            return null;
        }
    },

    async saveMemriseWords(memriseWords) {
        try {

            for (let i = 0; i < memriseWords.length; i++) {
                let word = memriseWords[i];

                let foreignWord = word["foreign_word"];
                let translation = word.translation;
                let level = parseInt(word.level);
                let url = word.url;

                await db.query("INSERT INTO memrise_levels (foreign_word, translation, level, url)" +
                    " VALUES  " +
                    "($1, $2, $3, $4);",

                    [foreignWord, translation, level, url]);
            }

            return 1;
        } catch (err) {
            console.log(err);
            return -1;
        }
    },

    // voice API
    async getVoiceIdByWord(word, language) {
        try {
            console.log("getVoiceIdByWord: " + word + ", " + language);
            const result = await db.query("SELECT id from voices where word = $1 and language = $2;",
                [word, language]);

            if (result.rows.length === 0)  {
                return -1;
            }

            return result.rows[0].id;
        } catch (err) {
            console.log(err);
            return -1;
        }
    },

    async getVoicePathById(id) {
        try {
            const result = await db.query("SELECT path from voices where id = $1;",
                [id]);

            if (result.rows.length === 0)  {
                return null;
            }

            return result.rows[0].path.toString();
        } catch (err) {
            console.log(err);
            return -1;
        }
    },

    async saveVoice(word, language, path) {
        try {
            await db.query("insert into voices (word, language, path) values ($1, $2, $3);",
                [word, language, path]);
        } catch (err) {
            console.log(err);
        }
    }
}