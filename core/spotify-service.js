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

function getRedirectURL() {
    const scope = ['playlist-read-private', 'playlist-read-collaborative',
        'playlist-modify-private', 'playlist-modify-public', 'user-read-email', 'user-read-private'];
    const state = 'someState';
    return new SpotifyWebApi(credentials).createAuthorizeURL(scope, state);
}

function getTokens(code) {
    return new SpotifyWebApi(credentials).authorizationCodeGrant(code).then((data) => {
        return data.body;
    },(err) => {
        console.log('Something went wrong in getTokens()', err);
    });
}

class SpotifyApi {
    constructor(tokens) {
        this.api = new SpotifyWebApi(credentials);
        this.api.setAccessToken(tokens.access_token);
        this.api.setRefreshToken(tokens.refresh_token);
    }

    getUser() {
        return this.api.getMe().then((data) => {
            this.userID = data.body.id;
            return data.body;
        },(err) => {
            console.log('Something went wrong!', err);
        });
    }

    getPlaylists() {
        return this.api.getUserPlaylists(this.userID).then((data) => {
            const items = data.body.items;
            const obj = [];
            for(let i = 0; i < items.length; i++) {
                obj.push({name: items[i].name, id: items[i].id});
            }
            return obj;
        },(err) => {
            console.log('Something went wrong!', err);
        });
    }

    getPlaylistTracks(playlistID, ownerID) {
        return this.api.getPlaylistTracks(ownerID, playlistID).then((data)  => {
            console.log('The playlist contains these tracks', data.body);
        },(err) => {
            console.log('Something went wrong!', err);
        });
    }
}


module.exports = {
    SpotifyApi : SpotifyApi,
    getTokens : getTokens,
    getRedirectURL : getRedirectURL
};