/**
 * Created by Tim on 2016-09-28.
 */

"use strict";

const middleware = require('./middleware');
const spotify = require('./spotifyService');
const express = require('express');

module.exports = function(Quiz) {
    const router = express.Router();

    router.get('/api/getPlaylists', middleware.ensureAuthenticated, function (req, res) {
        new spotify.SpotifyApi(req.user.accessToken, req.user.refreshToken).getPlaylists().then((playlists) => {
            res.status(200);
            return res.json(playlists);
        }).catch((err) => {
            res.status(500);
            return res.json(err);
        });
    });

    router.get('/api/getMe', middleware.ensureAuthenticated, function (req, res) {
        res.status(200);
        res.json(req.user);
    });

    router.get('/api/getCurrentQuestion', middleware.ensureAuthenticated, function (req, res) {
        const quizID = req.session.quizID;
        if (quizID) {
            Quiz.findOne({'quizID': quizID}, 'questionIndex questions', function (err, quiz) {
                if (!err && quiz) {
                    res.status(200);
                    return res.json(quiz.questions[quiz.questionIndex]);
                } else {
                    return res.sendStatus(500);
                }
            });
        } else {
            res.status(404);
            return res.json({message: 'User not in quiz'});
        }
    });

    router.get('/api/getResults', middleware.ensureAuthenticated, function (req, res) {
        const quizID = req.session.quizID;
        if (quizID) {
            Quiz.findOne({'quizID': quizID}, 'players', function (err, quiz) {
                if (!err && quiz) {
                    res.status(200);
                    return res.json(quiz.players);
                } else {
                    return res.sendStatus(500);
                }
            });
        } else {
            res.status(404);
            return res.json({message: 'User not in quiz'});
        }
    });

    router.get('/api/getCurrentQuiz', middleware.ensureAuthenticated, function (req, res) {
        const quizID = req.session.quizID;
        if (quizID) {
            Quiz.findOne({'quizID': quizID}, function (err, quiz) {
                if (!err && quiz) {
                    res.status(200);
                    return res.json(quiz);
                } else {
                    return res.sendStatus(500);
                }
            });
        } else {
            res.status(404);
            return res.json({message: 'User not in quiz'});
        }
    });

    router.post('/api/savePlaylist', middleware.ensureAuthenticated, function (req, res) {
        const quizID = req.session.quizID;
        if(quizID) {
            Quiz.findOne({'quizID': quizID}, 'name questions', function (err, quiz) {
                if(!err && quiz) {
                    const api = new spotify.SpotifyApi(req.user.accessToken, req.user.refreshToken);
                    api.savePlaylist(req.user.userID, quiz.name, quiz.questions).then(() => {
                        res.sendStatus(200);
                    }).catch((err) => {
                        res.status(500);
                        res.send(err);
                    })
                } else {
                    return res.sendStatus(500);
                }
            });
        } else {
            res.status(404);
            return res.json({message: 'User not in quiz'});
        }
    });

    return router;
};