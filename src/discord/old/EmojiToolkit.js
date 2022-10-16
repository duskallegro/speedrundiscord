const emojiToolkit = {
  emojiNames: ['A', 'B', 'C',
                'D', 'E', 'F',
                'G', 'H', 'I',
                'J', 'K', 'L',
                'M', 'N', 'O',
                'P', 'Q', 'R',
                'S', 'T', 'U',
                'V', 'W', 'X',
                'Y', 'Z'],
  emojis: ['🇦', '🇧', '🇨', '🇩',
                '🇪', '🇫', '🇬', '🇭',
                '🇮', '🇯', '🇰', '🇱',
                '🇲', '🇳', '🇴', '🇵',
                '🇶', '🇷', '🇸', '🇹',
                '🇺', '🇻', '🇼', '🇽',
                '🇾', '🇿'],
  findEmojiByName: function (name)  {
    let index = this.emojiNames.findIndex((element, index, array) =>  {
       if (element === name)  {
           return true;
       }

       return false;
    });

    if (index < 0)  {
        return null;
    }

    return this.emojis[index];
  },

    findNameByEmoji: function (emoji)  {
        let index = this.emojis.findIndex((element, index, array) =>  {
            if (element === emoji)  {
                return true;
            }

            return false;
        });

        if (index < 0)  {
            return null;
        }

        return this.emojiNames[index];
    },


    getLettersEmojisInRange: function(start, end)  {
      let result=[];

      for (let i = start.charCodeAt(0); i <= end.charCodeAt(0); i++)  {
          let letter = String.fromCharCode(i);
          result.push(this.findEmojiByName(letter));
      }
      return result;
  }
};

module.exports = {emojiToolkit}