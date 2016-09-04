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
        return new Promise((resolve, reject) => {
            this.api.getPlaylistTracks(ownerID, playlistID).then((data) => {
                resolve(data.body.items);
            },(err) => {
                reject(err);
            });
        });
    }

    getArtistOptions(artistId) {
        return new Promise((resolve, reject) => {
            this.api.getArtistRelatedArtists(artistId).then((data) => {
                const relatedArtists = data.body.artists;
                const artists = [];
                for (let i = 0; i < 3; i++) {
                    if(relatedArtists[i]) {
                        artists.push(relatedArtists[i].name);
                    } else {
                        artists.push('');
                    }
                }
                resolve(artists);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    savePlaylist(owner, name, questions) {
        const api = this.api;
        api.createPlaylist(owner, ('Charliequiz: ' + name), {'public' : false}).then((data) => {
            console.log(data);
            questions.forEach(function(question) {
                api.addTracksToPlaylist(owner, data.body.id, 'spotify:track:' + question.trackID);
            });
        }).catch((err) => {
            console.log('Something went wrong!', err);
        });
    }

    getSimilarTracks(track, noSimilarTracks, countryCode) {

    }

    similarTrackFromRelatedArtist(track) {

    }

    similarTrackFromAlbum(track) {

    }
}


module.exports = {
    SpotifyApi : SpotifyApi,
    getTokens : getTokens,
    getRedirectURL : getRedirectURL
};