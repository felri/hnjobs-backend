const sqlite3 = require('sqlite3');

const DBSOURCE = 'db.sqlite';

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error('Erro opening database ' + err.message);
  } else {
    db.run(
      'CREATE TABLE IF NOT EXISTS player( \
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        name text NOT NULL UNIQUE,\
        password text NOT NULL\
      )',
      (err) => {
        if (err) {
          console.log('Table already exists.');
        }
      }
    );
    db.run(
      'CREATE TABLE IF NOT EXISTS games( \
        id INTEGER PRIMARY KEY AUTOINCREMENT,\
        points INTEGER,\
        player_id INTEGER,\
        ai BOOLEAN, \
        FOREIGN KEY (player_id) REFERENCES player (id)\
    )',
      (err) => {
        if (err) {
          console.log(err);
          console.log('Table already exists.');
        }
      }
    );
  }
});

module.exports = db;
