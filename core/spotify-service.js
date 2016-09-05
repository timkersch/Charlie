'use strict';

/**
 * Created by Tim on 22/08/16.
 */

const dotenv = require('dotenv').config({path: '.env'});
const SpotifyWebApi = require('spotify-web-api-node');
const request = require('request');

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

function shuffle(arr) {
    let n = arr.length;
    let t;
    let i;

    while (n) {
        i = Math.floor(Math.random() * n--);

        t = arr[n];
        arr[n] = arr[i];
        arr[i] = t;
    }
    return arr;
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

    getQuestions(playlistId, ownerId, noTracks) {
        const api = this;
        return api.getPlaylistTracks(playlistId, ownerId).then((data) => {
            if (data.length >= noTracks) {
                let validityPromises = [];
                data = shuffle(data);
                data.forEach(function (obj) {
                    let track = obj.track;
                    let valProm = new Promise((resolve, reject) => {
                        request(track.preview_url, function (error, response, body) {
                            if (!error && response.statusCode === 200) {
                                resolve(track);
                            } else {
                                resolve();
                            }
                        });
                    });
                    validityPromises.push(valProm);
                });

                return Promise.all(validityPromises).then((result) => {
                    let dataPromises = [];
                    for(let i = 0; i < result.length; i++) {
                        if(dataPromises.length < noTracks) {
                            if(result[i]) {
                                dataPromises.push(api.getArtistOptions(result[i]));
                            }
                        } else {
                            break;
                        }
                    }
                    if(dataPromises.length === noTracks) {
                        return Promise.all(dataPromises).then((questions) => {
                            return questions;
                        });
                    } else {
                        throw new Error('Not enough valid songs in playlist');
                    }
                });
            } else {
                throw new Error('Not enough songs in playlist');
            }
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

    getArtistOptions(track) {
        return new Promise((resolve, reject) => {
            let artistID = track.artists[0].id;
            let artistName = track.artists[0].name;
            this.api.getArtistRelatedArtists(artistID).then((data) => {
                const relatedArtists = data.body.artists;
                let artists = [];
                for (let i = 0; i < 3; i++) {
                    if(relatedArtists[i]) {
                        artists.push(relatedArtists[i].name);
                    } else {
                        artists.push('');
                    }
                }
                artists.push(artistName);
                artists = shuffle(artists);
                const question = {
                    trackID: track.id,
                    trackName: track.name,
                    albumName: track.album.name,
                    correctArtist: track.artists[0].name,
                    trackUrl: track.preview_url,
                    artistOptions: artists
                };
                resolve(question);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    savePlaylist(owner, name, questions) {
        const api = this.api;
        api.createPlaylist(owner, ('Charliequiz: ' + name), {'public' : false}).then((data) => {
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