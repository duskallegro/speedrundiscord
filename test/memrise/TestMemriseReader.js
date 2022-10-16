const MemriseReader = require('../../src/discord/memrise/MemriseReader');

(async () => {
    let reader = new MemriseReader();
    let stuff = await reader.getVocabularyFromMemrise(1);
    console.log(stuff);

    /*    const vocab = await getVocabularyFromMemrise(1);

        // console.log("Total words: " + vocab.length);
        // console.log(vocab);

        await writeVocabToExcel(vocab);*/

    // const finalVocab = await downloadAllLevels();
    //await writeVocabToExcel(finalVocab);

    //  const vocab = await getVocabularyFromMemriseUrl("https://app.memrise.com/course/203799/5000-most-frequent-spanish-words/3/");
    // console.log(vocab);
})().catch(console.error);