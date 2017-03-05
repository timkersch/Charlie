/**
 * Created by Tim on 08/09/16.
 */

const Schema = require('mongoose').Schema;

const User = Schema({
    userID: String,
    name: String,
    country: String,
    accessToken: String,
    refreshToken: String,
    email: String,
    product: String,
});

module.exports = {
    User: User
};