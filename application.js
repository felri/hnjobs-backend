const express = require('express');
const router = require('./src/http/router.js');
const app = express();
const cors = require('cors');
const HTTP_PORT = 3232;

const bodyParser = require('body-parser');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(HTTP_PORT, () => {
  console.log(`Server running on port ${HTTP_PORT}`);
});

app.use('/', router);
