/**
 * Created by Tim on 04/09/16.
 */

const Schema = require('mongoose').Schema;

const Quiz = Schema({
    quizID: String,
    name: String,
    owner: String,
    nbrOfSongs: Number,
    questionIndex: Number,
    started: Boolean,
    finished: Boolean,
    playlist: {
        id: String,
        owner: String,
        generated: Boolean,
    },
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

