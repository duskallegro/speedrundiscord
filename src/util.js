function randomInRange(min, max) {
    return Math.floor((Math.random()) * (max - min + 1)) + min;
}

function getRandomInArray(array)  {
    return Math.floor(Math.random() * array.length);
}

module.exports = {randomInRange, getRandomInArray};