const makeComplexCommand = (vocab, splitVocab) => {
    return {
        "name": "",
        'description': "",
        "commands": {},
        "action": null,
        "chooser": null,
        hasCommand: function (commandName)  {
          this.commands.forEach((c) =>  {
             if (c.name === commandName)  {
                 return true;
             }
          });

          return false;
        },
        vocab: vocab,
        splitVocab: splitVocab,
    };
};

const makeSimpleCommand = (name, description, action) =>  {
    return {
        "name": name,
        'description': description,
        "action": action
    };
};

module.exports = {makeComplexCommand: makeComplexCommand,
            makeSimpleCommand: makeSimpleCommand};