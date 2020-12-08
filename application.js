const express = require('express');
const router = require('./src/http/router.js');
const controllerCreate = require('./src/http/controllerCreate.js');

const app = express();
const cors = require('cors');
const schedule = require('node-schedule');

const db = require('./src/models');

require('dotenv').config();

const HTTP_PORT = 3233;

const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

db.mongoose
  .connect(db.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to the database!');
  })
  .catch((err) => {
    console.log('Cannot connect to the database!', err);
    process.exit();
  });

app.listen(HTTP_PORT, () => {
  console.log(`Server running on port ${HTTP_PORT}`);
});

app.use('/', router);

schedule.scheduleJob('0 12 * * *', function () {
  console.log('Getting new jobs');
  controllerCreate.getNewJobs();
});
