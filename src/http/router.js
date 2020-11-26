const express = require('express'),
  router = express.Router();
const controller = require('./controller.js');

router.post('/api/player/', (req, res) => {
  controller.createUser(req, res);
});

router.post('/api/get_player/', (req, res) => {
  controller.getUser(req, res);
});

router.post('/api/second_player/', (req, res) => {
  controller.secondPlayer(req, res);
});

router.post('/api/game/', (req, res) => {
  controller.createGame(req, res);
});

router.post('/api/get_score/', (req, res) => {
  controller.getScoreboard(req, res);
});

router.get('/api/get_word', (req, res) => {
  controller.getWord(req, res);
});

module.exports = router;
