/**
 * Created by Tim on 08/09/16.
 */

const Schema = require('mongoose').Schema;

const User = Schema({
    userID: String,
    country: String,
    email: String,
    product: String,
    quizIDs: [String]
});

module.exports = {
    User: User
};