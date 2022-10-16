//import {hello} from './discord/test'

const hello = require('./discord/old/test');
const cors = require('cors');

hello.hello();


const express = require('express');
const bodyParser = require('body-parser');
const database = require("./database");
const memriseScraper = require('./discord/old/memrise-scraper');
const port = 3000;

const app = express();


var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
}
app.use(cors(corsOptions));
app.use(express.json());

//app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});

/*
app.get('/test', (request, response) =>  {
    response.sendFile("/home/copper/WebstormProjects/web/speedrunspanish/backend/src/tiempo.mp3");
});

var fs = require('fs');
*/

var fs = require('fs');

app.get('/test', (request, response) => {
    var filePath = "/home/copper/WebstormProjects/web/speedrunspanish/backend/src/tiempo.mp3";
    var stat = fs.statSync(filePath);

    response.writeHead(200, {
        'Content-Type': 'audio/mp3',
        'Content-Length': stat.size,
    });

    var readStream = fs.createReadStream(filePath);
    readStream.pipe(response);


});

app.get('/voice/:id', async (request, response) => {
    let filePath = await database.getVoicePathById(request.params.id); //"../voices/ejemplo_es_1645261337275.mp3"; // await database.getVoicePathById(request.params.id);
    console.log("filePath: " + filePath);

    let stat = fs.statSync(filePath);

    response.writeHead(200, {
        'Content-Type': 'audio/mp3',
        'Content-Length': stat.size,
        "Access-Control-Allow-Origin": "*"
    });

    //filePath = encodeURIComponent(filePath.toString());
    let readStream = fs.createReadStream(filePath.toString());
    readStream.pipe(response);
});

app.post('/voice/new', async (req, res) => {
    const {word, language} = req.query;
    console.log("word = " + word + ", language = " + language);

    let link = googleSpeaker.googleSpeaker.generateGoogleTTSLink(word, language, '410353.1336369826');
    console.log("link: " + link);

    let path = "../voices/" + word + "_" + language + "_" + new Date().getTime() + ".mp3";

    console.log("path: " + path);
    await googleSpeaker.googleSpeaker.download(link, path, (message) => {
            console.log(message)
        });

    await database.saveVoice(word, language, path);

    res.json({success: "OK"});
});

app.get('/voice/get/id', async (request, response) => {
    const {word, language} = request.query;

    let id = await database.getVoiceIdByWord(word, language);
    response.json({"id": id});
});

const googleSpeaker = require("./GoogleSpeaker");

app.get('/memrise', async (request, response) => {
    //let url = "https://app.memrise.com/course/203799/5000-most-frequent-spanish-words/4/";
    const {url, language} = request.query;

    console.log("language: " + language);

    console.log("Checking database...");
    let memriseWords = await database.getMemriseByUrl(url);
    //console.log(memriseWords);

    if (memriseWords.length === 0) {
        console.log("Not in the database, downloading...");

        hello.hello();
        const downloadedWords = await memriseScraper.getVocabularyFromMemriseUrl(url);
        console.log("Downloaded " + downloadedWords.length + " words...");

        console.log("Saving to database...");
        await database.saveMemriseWords(downloadedWords);
        console.log();

        memriseWords = await database.getMemriseByUrl(url);

        console.log("After saving retrieved back by url " + memriseWords.length + " words...");


    }

    // console.log(memriseWords);

    response.json({data: memriseWords});
});


app.get('/tiempo', (request, response) => {
    //response.set('content-type', 'audio/mp3');

    //  response.sendFile("tiempo.mp3");
    response.json({data: "oof"});

});
