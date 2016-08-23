'use strict';

/**
 * Created by Tim on 22/08/16.
 */

const dotenv = require('dotenv').config({path: '.env'});
const SpotifyWebApi = require('spotify-web-api-node');

const credentials = {
    clientId : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    redirectUri : process.env.CALLBACK
};

class SpotifyApi {
    constructor() {
        this.api = new SpotifyWebApi(credentials);
    }

    getRedirectURL() {
        const scope = ['playlist-read-private', 'playlist-read-collaborative',
            'playlist-modify-private', 'playlist-modify-public', 'user-read-email', 'user-read-private'];
        const state = 'someState';
        return this.api.createAuthorizeURL(scope, state);
    }

    getUser(code) {
        this.api.authorizationCodeGrant(code).then((data) => {
            api.setAccessToken(data.body['access_token']);
            api.setRefreshToken(data.body['refresh_token']);
        },(err) => {
            console.log('Something went wrong!', err);
        });
    }
}

module.exports = {
    SpotifyApi : SpotifyApi
};