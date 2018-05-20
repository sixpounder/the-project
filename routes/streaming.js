const express = require('express');
const router = express.Router();

const SessionAuth = require(resolveModule('policies/sessionAuth'));
const StreamController = require(resolveModule('api/StreamController'));

router.get('/channels/:id/:stream?', SessionAuth, StreamController.stream);

module.exports = router;