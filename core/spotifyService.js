'use strict';

/**
 * Created by Tim on 22/08/16.
 */

const dotenv = require('dotenv').config({path: '.env', silent: true});
const SpotifyWebApi = require('spotify-web-api-node');
const request = require('request');
const utils = require('./helpers');

const credentials = {
    clientId : process.env.CLIENT_ID,
    clientSecret : process.env.CLIENT_SECRET,
    redirectUri : process.env.CALLBACK
};

function testUrl(track) {
    return new Promise((resolve, reject) => {
        request(track.preview_url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                resolve(track);
            } else {
                resolve();
            }
        });
    });
}

class SpotifyApi {
    constructor(accessToken, refreshToken) {
        this.api = new SpotifyWebApi(credentials);
        this.api.setAccessToken(accessToken);
        this.api.setRefreshToken(refreshToken);
    }

    getUser() {
        return this.api.getMe().then((data) => {
            this.user = data.body.id;
            return {
                userID : data.body.id,
                birthdate : data.body.birthdate,
                country: data.body.country,
                dispName: data.body.display_name,
                email: data.body.email,
                product: data.body.product
            };
        },(err) => {
            console.log('Something went wrong!', err);
        });
    }

    getPlaylists() {
        return this.api.getUserPlaylists(this.userID).then((data) => {
            const items = data.body.items;
            const obj = [];
            for(let i = 0; i < items.length; i++) {
                obj.push({name: items[i].name, id: items[i].id, playlistOwner: items[i].owner.id, noTracks: items[i].tracks.total});
            }
            return obj;
        },(err) => {
            console.log('Something went wrong!', err);
        });
    }

    getQuestions(tracks, noTracks) {
        let validityPromises = [];
        tracks.forEach(function (obj) {
            let track = obj.track;
            let valProm = testUrl(track);
            validityPromises.push(valProm);
        });
        return this.getOptionsForValidTracks(validityPromises, noTracks);
    }

    getQuestionsGenerated(tracks, noTracks) {
        const ref = this;
        let similarTracksPromise = [];
        tracks.forEach(function (track) {
            similarTracksPromise.push(ref.getSimilarTrack(track));
        });
        return this.getOptionsForValidTracks(similarTracksPromise, noTracks);
    }

    getQuizQuestions(playlistId, noTracks, shuffle, ownerId) {
        return this.getPlaylistTracks(playlistId, ownerId).then((tracks) => {
            if(tracks.length >= noTracks) {
                if(shuffle === true) {
                    return this.getQuestions(utils.shuffle(tracks), noTracks);
                } else {
                    return this.getQuestions(tracks, noTracks);
                }
            } else {
                throw new Error('Not enough songs in playlist');
            }
        });
    }

    getSimilarTrack(track) {
        const api = this.api;
        return new Promise((resolve, reject) => {
            const url = 'https://api.spotify.com/v1/recommendations';
            const auth = {
                bearer: api.getAccessToken()
            };
            const qs = {
                limit: 1,
                seed_tracks : track.track.id,
                seed_artists : track.track.artists[0].id
            };

            request.get({url: url, auth: auth, qs: qs, json: true}, function (error, response, body) {
                if(!error && response.statusCode === 200) {
                    testUrl(body.tracks[0]).then((data) => {
                        resolve(data);
                    });
                } else {
                    reject();
                }
            });
        });
    }

    getOptionsForValidTracks(tracksPromises, noTracks) {
        return Promise.all(tracksPromises).then((result) => {
            let dataPromises = [];
            for (let i = 0; i < result.length; i++) {
                if (dataPromises.length < noTracks) {
                    if (result[i]) {
                        dataPromises.push(this.getArtistOptions(result[i]));
                    }
                } else {
                    break;
                }
            }
            if (dataPromises.length === noTracks) {
                return Promise.all(dataPromises).then((questions) => {
                    return questions;
                });
            } else {
                throw new Error('Not enough valid songs in playlist');
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
                artists = utils.shuffle(artists);
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
        return new Promise((resolve, reject) => {
            api.createPlaylist(owner, ('Charliequiz: ' + name), {'public' : false}).then((data) => {
                questions.forEach(function(question) {
                    api.addTracksToPlaylist(owner, data.body.id, 'spotify:track:' + question.trackID);
                });
                resolve();
            }).catch((err) => {
                reject(err);
            });
        });
    }
}


module.exports = {
    SpotifyApi : SpotifyApi
};
