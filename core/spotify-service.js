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

const api = new SpotifyWebApi(credentials);

function getRedirectURL() {
    const scope = ['playlist-read-private', 'playlist-read-collaborative',
        'playlist-modify-private', 'playlist-modify-public', 'user-read-email', 'user-read-private'];
    const state = 'someState';
    return api.createAuthorizeURL(scope, state);
}

module.exports = {
    getRedirectURL : getRedirectURL
};