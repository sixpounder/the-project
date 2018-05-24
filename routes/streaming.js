const express = require('express');
const router = express.Router();

// const SessionAuth = require(resolveModule('policies/sessionAuth'));
const StreamController = require(resolveModule('api/StreamController'));

router.get('/channels/:id/:stream?', StreamController.stream);
// router.get('/channels/stream/:id/:stream', StreamController.get);

module.exports = router;