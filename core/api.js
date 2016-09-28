/**
 * Created by Tim on 2016-09-28.
 */

"use strict";

const middleware = require('./middleware');
const express = require('express');
const router = express.Router();

router.get('/api/get-playlists', middleware.ensureAuthenticated, function(req, res) {

});