const Person = require('./Person');

class Outer  {
    constructor()  {
        this.setup();
    }

    async setup()  {
        this.first = this.normalFunction();
        this.second = new Person(); // 1
        await this.second.setup();
        this.third = this.second.name;  // 3
        console.log("In Outer: " + this.third);
    }

    normalFunction()  {
        return 1;
    }
}

module.exports = Outer;