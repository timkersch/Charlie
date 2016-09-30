/**
 * Created by Tim on 03/09/16.
 */

const io = require('socket.io-client');

module.exports =
    function () {
        const socket = io();

        socket.on('connect', function(){
            console.log('socketio open!');
        });

        socket.on('disconnect', function(){
            console.log("socketio close!");
        });

        return {
            // ----------- Quiz management -----------
            createQuiz: function (name, playlistId, playlistName, owner, nbrOfSongs, shuffle, callback) {
                let data = {
                    name: name,
                    playlistID: playlistId,
                    playlistName: playlistName,
                    nbrOfSongs: parseInt(nbrOfSongs),
                    shuffle: shuffle,
                    generated: false,
                    playlistOwner: owner
                };
                socket.emit('createQuiz', data);
                socket.once('createQuizCallback', function(quiz) {
                    if(!quiz || quiz.error) {
                        callback(quiz);
                    } else {
                        callback(quiz);
                    }
                });
            },

            joinQuiz: function (data, callback) {
                socket.emit('joinQuiz', data);
                socket.once('joinQuizCallback', function(quiz) {
                    if (quiz && !quiz.error) {
                        callback(quiz);
                    } else {
                        callback(quiz);
                    }
                });
            },

            leaveQuiz: function () {
                socket.emit('leaveQuiz');
            },

            nextQuestion: function () {
                socket.emit('nextQuestion');
            },

            answerQuestion: function (artistName) {
                socket.emit('answerQuestion', artistName);
            },


            // -------- Listeners --------
            timeLeft : function(callback) {
                socket.on('timeLeft', function(time) {
                    callback(time);
                });
            },

            userJoined : function(callback) {
                socket.on('userJoined', function(user) {
                    callback(user);
                });
            },

            userLeft: function(callback) {
                socket.on('userLeft', function(player) {
                    callback(player);
                });
            },

            quizStart : function(callback) {
                socket.on('quizStart', function(data) {
                    callback(data);
                });
            },

            gameOver : function(callback) {
                socket.on('gameOver', function() {
                    callback();
                });
            },

            newQuestion : function(callback) {
                socket.on('newQuestion', function(data) {
                    callback(data);
                });
            },

            userPointsUpdate : function(callback) {
                socket.on('userPointsUpdate', function(data) {
                    callback(data);
                });
            },

            unregisterAllListeners : function() {
                socket.off('userPointsUpdate');
                socket.off('newQuestion');
                socket.off('gameOver');
                socket.off('quizStart');
                socket.off('userLeft');
                socket.off('userJoined');
                socket.off('timeLeft');
            },

            unregisterUserListeners : function() {
                socket.off('userLeft');
                socket.off('userJoined');
                socket.off('quizStart');
            }
        };
    };