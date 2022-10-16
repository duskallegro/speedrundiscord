const ExcelDatabase = require('../../src/ExcelDatabase');

(async () => {
  let excel = new ExcelDatabase();
  let stuff = excel.getVocabFromExcelFile();
  let splitted = excel.splitIntoLevels(stuff);
  console.log(splitted);
})().catch(console.error);