const md5 = require('md5');
const db = require('../utils/db.js');
const wordlist = require('../utils/wordlist');

function checkParamsPlayer(req) {
  let errors = [];
  if (!req.body.password) errors.push('No password specified');
  if (!req.body.name) errors.push('No user name specified');

  if (errors.length) {
    return { errors: errors.join(',') };
  }
  return {
    name: req.body.name,
    password: md5(req.body.password),
  };
}

function checkParamsGames(req) {
  let errors = [];
  if (!req.body.player_id) errors.push('No user name specified');

  if (errors.length) {
    return { errors: errors.join(',') };
  }
  return {
    points: req.body.points,
    player_id: req.body.player_id,
    ai: !!req.body.ai,
  };
}

function createUser(req, res) {
  const sql = 'INSERT INTO player (name, password) VALUES (?,?)';
  const data = checkParamsPlayer(req);
  if (data.errors)
    return res.status(400).json({ error: data.errors.join(',') });
  else {
    const params = [data.name, data.password];
    db.run(sql, params, function (err, result) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: { ...data, id: this.lastID },
      });
    });
  }
}

function getUser(req, res) {
  const sql =
    'select * from player where UPPER(name) = UPPER(?) and password = ?';
  const data = checkParamsPlayer(req);
  if (data.errors)
    return res.status(400).json({ error: data.errors.join(',') });
  else {
    var params = [data.name, data.password];
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: row,
      });
    });
  }
}

function createGame(req, res) {
  const sql = 'INSERT INTO games (player_id, points, ai) VALUES (?,?,?)';
  const data = checkParamsGames(req);
  if (data.errors)
    return res.status(400).json({ error: data.errors.join(',') });
  else {
    const params = [data.player_id, data.points, data.ai];
    db.run(sql, params, function (err, result) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: { ...data, id: this.lastID },
      });
    });
  }
}

function getScoreboard(req, res) {
  const sql = `
  SELECT name, player_id, SUM(points) / (COUNT(*) * 1.0) as points 
    FROM games 
    INNER JOIN player ON games.player_id = player.id 
    WHERE ai = ? 
    GROUP BY player_id
    ORDER BY points DESC
    LIMIT 3
  `;
  const params = [req.body.ai];
  db.all(sql, params, function (err, rows) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows,
    });
  });
}

function secondPlayer(req, res) {
  const sql =
    'select * from player where UPPER(name) = UPPER(?) and password = ?';
  const data = checkParamsPlayer(req);
  if (data.errors)
    return res.status(400).json({ error: data.errors.join(',') });
  else {
    var params = [data.name, data.password];
    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      if (!row) {
        createUser(req, res);
        return;
      }
      res.json({
        message: 'success',
        data: row,
      });
    });
  }
}

function getWord(req, res) {
  res.json({
    word: wordlist[Math.floor(Math.random() * wordlist.length)],
  });
}

module.exports = {
  secondPlayer,
  getScoreboard,
  createGame,
  getUser,
  createUser,
  getWord,
};
