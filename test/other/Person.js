class Person  {
    constructor()  {
        this.stuff = 1;
        // this.setup();
    }

    async setup()  {
        this.name = await this.asyncFunction();  // 2
        console.log(this.name);  // 4
    }

    async asyncFunction()  {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('Peter');
            }, 3000);
        });
    }
}

module.exports = Person;