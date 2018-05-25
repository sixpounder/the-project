const express = require('express');
const router = express.Router();

// const SessionAuth = require(resolveModule('policies/sessionAuth'));
const StreamController = require(resolveModule('api/StreamController'));

router.post('/channels/:id', StreamController.create);
// router.get('/channels/stream/:id/:chunk.ts', StreamController.streamChunk);
// router.get('/channels/stream/:id/:manifest.m3u8', StreamController.streamManifest);
router.get('/channels/:id/:stream', StreamController.stream);
// router.get('/channels/stream/:id/:stream', StreamController.get);

module.exports = router;