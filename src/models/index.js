const mongoose = require('mongoose');
const url = 'mongodb://localhost:27017/hackernewsjobs';

mongoose.Promise = global.Promise;

const db = {};
db.mongoose = mongoose;
db.url = url;
db.jobs = require('./jobs.model.js')(mongoose);

module.exports = db;
