'use strict';
/**
 * Created by Tim on 05/09/16.
 */

/**
 * Counts down with a 1 seconds pause and emits the counter value every second
 * @param i the counter index to start at
 * @param io socket.io object
 * @param quizID room to send event to
 */
function countDown(i, io, quizID) {
    let int = setInterval(function () {
        io.to(quizID).emit('timeLeft', --i);
        if(i === 0) {
            clearInterval(int);
        }
    }, 1000);
}

/**
 * Generates a uid for joining quizes
 * @returns {string} the uid / roomID for a quiz
 */
function generateUID() {
    let uid = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
    return uid;
}

/**
 * Initializes a new array with empty strings
 * @param size the size of the array
 * @returns {Array} the empty string array
 */
function initArr(size) {
    let answersArray = [];
    for(let i = 0; i < size; i++) {
        answersArray.push('');
    }
    return answersArray;
}

module.exports = {
    countDown: countDown,
    generateUID: generateUID,
    initArr: initArr
};