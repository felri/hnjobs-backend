const express = require('express'),
  router = express.Router();
const controllerCreate = require('./controllerCreate.js');
const controllerGet = require('./controllerGet.js');

router.post('/api/createJobs', (req, res) => {
  controllerCreate.createJobs(req, res);
});

router.post('/api/getFullJobsPercentage', (req, res) => {
  controllerGet.getFullJobsPercentage(req, res);
});

router.post('/api/getHistoryLanguage', (req, res) => {
  controllerGet.getHistoryLanguage(req, res);
});

router.post('/api/getJobsFromMonthLanguage', (req, res) => {
  controllerGet.getJobsFromMonthLanguage(req, res);
});

router.get('/api/createJobs', (req, res) => {
  controllerCreate.createJobs(req, res);
});

module.exports = router;
