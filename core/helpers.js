'use strict';
/**
 * Created by Tim on 05/09/16.
 */

function countDown(i, io, quizID) {
    let int = setInterval(function () {
        io.to(quizID).emit('timeLeft', --i);
        if(i === 0) {
            clearInterval(int);
        }
    }, 1000);
}

function generateUID() {
    let uid = ("0000" + (Math.random()*Math.pow(36,4) << 0).toString(36)).slice(-4);
    return uid;
}

function initArr(size) {
    let answersArray = [];
    for(let i = 0; i < size; i++) {
        answersArray.push('');
    }
    return answersArray;
}

function shuffle(arr) {
    let n = arr.length;
    let t;
    let i;

    while (n) {
        i = Math.floor(Math.random() * n--);

        t = arr[n];
        arr[n] = arr[i];
        arr[i] = t;
    }
    return arr;
}

function getColors() {
    return shuffle(['green-avatar', 'orange-avatar', 'blue-avatar', 'red-avatar', 'purple-avatar', 'teal-avatar'])
}

module.exports = {
    countDown: countDown,
    generateUID: generateUID,
    initArr: initArr,
    getColors: getColors,
    shuffle: shuffle
};