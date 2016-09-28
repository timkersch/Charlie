/**
 * Created by Tim on 2016-09-28.
 */
"use strict";

const middleware = require('./middleware');

module.exports = function (app, passport) {
    const scope = ['playlist-read-private', 'playlist-read-collaborative',
        'playlist-modify-private', 'playlist-modify-public', 'user-read-email', 'user-read-private'];

    app.get('/auth/spotify', passport.authenticate('spotify', {scope: scope, showDialog: true}), function(req, res){
        // The request will be redirected to spotify for authentication
    });

    app.get('/auth/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/' }), function(req, res) {
        // Successful authentication, redirect
        return res.redirect('/home');
    });

    app.get('/logout', middleware.ensureAuthenticated, function(req,res){
        req.logOut();
        req.session.destroy(function (err) {
            res.redirect('/');
        });
    });

    app.get('/api/test', middleware.ensureAuthenticated, function(req, res) {
        console.log('here', req.isAuthenticated());
    });
};