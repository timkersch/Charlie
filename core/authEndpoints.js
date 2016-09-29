/**
 * Created by Tim on 2016-09-28.
 */
"use strict";

const middleware = require('./middleware');
const express = require('express');

module.exports = function (passport) {
    const router = express.Router();

    const spotifyScope = ['playlist-read-private', 'playlist-read-collaborative',
        'playlist-modify-private', 'playlist-modify-public', 'user-read-email', 'user-read-private'];

    router.get('/auth/spotify', passport.authenticate('spotify', {scope: spotifyScope, showDialog: true}), function(req, res){
        // The request will be redirected to spotify for authentication
    });

    router.get('/auth/spotify/callback', passport.authenticate('spotify', { failureRedirect: '/' }), function(req, res) {
        return res.redirect('/home');
    });

    router.get('/logout', middleware.ensureAuthenticated, function(req,res){
        req.logOut();
        res.redirect('/');

        // TODO should destroy session when done
        //req.session.destroy(function (err) {
        //});
    });

    return router;
};