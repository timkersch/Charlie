/**
 * Created by Tim on 2016-09-28.
 */
"use strict";

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
};