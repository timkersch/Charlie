'use strict';

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var spotify = require('./core/spotify-service.js');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('webapp'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/webapp/index.html');
});

io.on('connection', function (socket) {
    console.log('user', socket.id, 'connected');

    socket.on('getLoginURL', function (msg) {
        var obj = { data: spotify.getRedirectURL(), request_id: msg.request_id };
        socket.emit('callback', obj);
    });

    socket.on('login', function (msg) {
        msg.data = 'Tim';
        socket.emit('callback', msg);
    });

    socket.on('setUser', function (id, msg) {
        socket.broadcast.to(id).emit('setUser', msg);
    });

    socket.on('getPlaylists', function (id, msg) {
        socket.broadcast.to(id).emit('getPlaylists', msg);
    });

    socket.on('getCurrentQuestion', function (id, msg) {
        socket.broadcast.to(id).emit('getCurrentQuestion', msg);
    });

    socket.on('isQuizStarted', function (id, msg) {
        socket.broadcast.to(id).emit('isQuizStarted', msg);
    });

    socket.on('getUsers', function (id, msg) {
        socket.broadcast.to(id).emit('getUsers', msg);
    });

    socket.on('getUsersInQuiz', function (id, msg) {
        socket.broadcast.to(id).emit('getUsersInQuiz', msg);
    });

    socket.on('logout', function (id, msg) {
        socket.broadcast.to(id).emit('logout', msg);
    });

    socket.on('getResults', function (id, msg) {
        socket.broadcast.to(id).emit('getResults', msg);
    });

    socket.on('getQuiz', function (id, msg) {
        socket.broadcast.to(id).emit('getQuiz', msg);
    });

    socket.on('savePlaylist', function (id, msg) {
        socket.broadcast.to(id).emit('savePlaylist', msg);
    });

    socket.on('createQuiz', function (id, msg) {
        socket.broadcast.to(id).emit('createQuiz', msg);
    });

    socket.on('getUserResults', function (id, msg) {
        socket.broadcast.to(id).emit('getUserResults', msg);
    });

    socket.on('nextQuestion', function (id, msg) {
        socket.broadcast.to(id).emit('nextQuestion', msg);
    });

    socket.on('leaveQuiz', function (id, msg) {
        socket.broadcast.to(id).emit('leaveQuiz', msg);
    });

    socket.on('joinQuiz', function (id, msg) {
        socket.broadcast.to(id).emit('joinQuiz', msg);
    });

    socket.on('answerQuestion', function (id, msg) {
        socket.broadcast.to(id).emit('answerQuestion', msg);
    });

    socket.on('disconnect', function () {
        console.log('user', socket.id, 'disconnected');
        //socket.emit('disconnect', {});
    });
});

http.listen(8080, function () {
    console.log('listening on *:8080');
});

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));
//app.use('/', routes);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handlers
//
// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//   app.use(function(err, req, res, next) {
//     res.status(err.status || 500);
//     //res.render('error', {
//       //message: err.message,
//       //error: err
//     //});
//   });
// }
//
// // production error handler
// // no stacktraces leaked to user
// app.use(function(err, req, res, next) {
//   res.status(err.status || 500);
//   //res.render('error', {
//     //message: err.message,
//     //error: {}
//   //});
// });


module.exports = app;

//# sourceMappingURL=app-compiled.js.map