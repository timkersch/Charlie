/**
 * Created by Tim on 08/09/16.
 */

const Schema = require('mongoose').Schema;

const User = Schema({
    id: String,
    birthdate : String,
    country: String,
    name: String,
    email: String,
    product: String,
    quizIDs: [String]
});

module.exports = {
    User: User
};