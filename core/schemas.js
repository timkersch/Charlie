/**
 * Created by Tim on 04/09/16.
 */

const Schema = require('mongoose').Schema;

const Quiz = Schema({
    quizID: String,
    name: String,
    generated: Boolean,
    owner: String,
    playlist: String,
    nbrOfSongs: Number,
    questionIndex: Number,
    started: Boolean,
    finished: Boolean,
    players: [{
        userID: String,
        answers: [String],
        points: Number
    }],
    questions: [{
        trackID: String,
        trackName: String,
        albumName: String,
        correctArtist: String,
        artistOptions: [String],
        trackUrl: String
    }]
});

module.exports = {
    Quiz: Quiz
};

