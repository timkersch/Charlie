/**
 * Created by Tim on 2016-09-28.
 */

"use strict";

const middleware = require('./middleware');
const spotify = require('./spotifyService');
const express = require('express');
const router = express.Router();

router.get('/api/getPlaylists', middleware.ensureAuthenticated, function(req, res) {
    console.log("in getPlaylists");

    new spotify.SpotifyApi(req.user.accessToken, req.user.refreshToken).getPlaylists().then((playlists) => {
        res.status(200);
        return res.json(playlists);
    }).catch((err) => {
        res.status(500);
        return res.json(err);
    });
});

router.get('/api/getMe', middleware.ensureAuthenticated, function(req, res) {
    res.status(200);
    res.json(req.user);
});


router.get('/api/getCurrentQuestion', middleware.ensureAuthenticated, function(req, res) {
    // socket.on('getCurrentQuestion', function () {
    //     console.log('in getCurrentQuestion');
    //
    //     sessionStore.load(session_id, function (err, storage) {
    //         if (storage.user && storage.quizID) {
    //             Quiz.findOne({'quizID': storage.quizID}, 'questionIndex questions', function (err, quiz) {
    //                 socket.emit('getCurrentQuestionCallback', {
    //                     question: quiz.questions[quiz.questionIndex],
    //                     questionIndex: quiz.questionIndex
    //                 });
    //             });
    //         }
    //     });
    // });
});


router.get('/api/getResults', middleware.ensureAuthenticated, function(req, res) {
    // socket.on('getResults', function () {
    //     console.log("in getResults");
    //
    //     sessionStore.load(session_id, function (err, storage) {
    //         if (storage.user && storage.quizID) {
    //             Quiz.findOne({'quizID': storage.quizID}, 'players', function (err, quiz) {
    //                 socket.emit('getResultsCallback', quiz.players);
    //             });
    //         }
    //     });
    // });
});

router.get('/api/isStarted', middleware.ensureAuthenticated, function(req, res) {
    // socket.on('isQuizStarted', function () {
    //     console.log("in isQuizStarted");
    //     sessionStore.load(session_id, function (err, storage) {
    //         Quiz.findOne({'quizID': storage.quizID}, 'started', function (err, quiz) {
    //             socket.emit('isQuizStartedCallback', quiz.started);
    //         });
    //     });
    // });
});


router.get('/api/getCurrentQuiz', middleware.ensureAuthenticated, function(req, res) {
    // socket.on('getQuiz', function () {
    //     console.log("in getQuiz");
    //     sessionStore.load(session_id, function (err, storage) {
    //         Quiz.findOne({'quizID': storage.quizID}, function (err, quiz) {
    //             socket.emit('getQuizCallback', quiz);
    //         });
    //     });
    // });
});

router.post('/api/savePlaylist', middleware.ensureAuthenticated, function(req, res) {
    // socket.on('savePlaylist', function () {
    //     console.log("in savePlaylist");
    //     sessionStore.load(session_id, function (err, storage) {
    //         Quiz.findOne({'quizID': storage.quizID}, 'name questions', function (err, quiz) {
    //             const api = new spotify.SpotifyApi(storage.tokens);
    //             api.savePlaylist(storage.user, quiz.name, quiz.questions);
    //         });
    //     });
    // });
});

module.exports = router;