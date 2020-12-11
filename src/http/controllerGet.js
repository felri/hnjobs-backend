const db = require('../models');
const Jobs = db.jobs;
const wordlist = require('../utils/wordlist');

function countOcurrencies(language, type, req) {
  let filters = {};
  if (req.body.year) filters.year = req.body.year;
  if (req.body.month) filters.month = req.body.month;

  return Jobs.countDocuments({
    languages: language,
    ...filters,
  }).then((result) => {
    if (result !== 0)
      return {
        name: language,
        type,
        result,
      };
  });
}

function formatDataHistory(arrayHistory) {
  return arrayHistory.map((f) => {
    return {
      id: `${f._id.year}${f._id.month}`,
      count: f.count,
      language: f.language,
      month: f.month,
      year: f.year,
      percentage: f.percentage,
    };
  });
}

async function getHistoryLanguage(req, res) {
  if (!req.body.languages) {
    res.status(500).json({ error: 'no language' });
    return;
  }
  if (!req.body.month) {
    res.status(500).json({ error: 'no month' });
    return;
  }
  if (!req.body.year) {
    res.status(500).json({ error: 'no year' });
    return;
  }

  let list = [];
  for (let i = 0; i < req.body.languages.length; i++) {
    const resp = await Jobs.aggregate([
      {
        $match: {
          $or: [
            { year: { $gt: req.body.year } },
            { month: { $gte: parseInt(req.body.month) } },
          ],
          languages: req.body.languages[i],
        },
      },
      {
        $group: {
          _id: { month: '$month', year: '$year' },
          count: { $sum: 1 },
          language: { $first: req.body.languages[i] },
          month: { $first: '$month' },
          year: { $first: '$year' },
        },
      },
    ]).then(async (result) => {
      const list = [];
      for (let i = 0; i < result.length; i++) {
        const countJobsInMonthYear = await Jobs.countDocuments({
          month: result[i].month,
          year: result[i].year,
        });
        list.push({
          ...result[i],
          percentage: Math.round(
            (result[i].count / countJobsInMonthYear) * 100
          ),
        });
      }
      return list;
    });
    list.push(formatDataHistory(resp));
  }
  res.json(list);
}

async function getJobsFromMonthLanguage(req, res) {
  let filters = {};
  if (req.body.month) filters.month = req.body.month;
  if (req.body.year) filters.year = req.body.year;
  if (req.body.remote) filters.remote = req.body.remote;

  if (req.body.language)
    filters = {
      ...filters,
      languages: { $in: req.body.language },
    };

  const resp = await Jobs.find(filters)
    .sort({ _id: -1 })
    .then((result) => {
      return result.map((f) => ({
        by: f.by,
        month: f.month,
        year: f.year,
        text: f.text,
        languages: f.languages,
      }));
    });
  res.json(resp);
}

async function getFullJobsPercentage(req, res) {
  if (!req.body.year) {
    res.status(500).json({ error: 'no year' });
    return;
  }

  let list = [];
  if (!req.body.type || req.body.type === 'languages')
    for (let j = 0; j < wordlist.LANGUAGES.length; j++) {
      const data = await countOcurrencies(
        wordlist.LANGUAGES[j].name,
        'language',
        req
      );
      if (data) list.push(data);
    }
  if (!req.body.type || req.body.type === 'frameworks')
    for (let j = 0; j < wordlist.FRAMEWORKS.length; j++) {
      const data = await countOcurrencies(
        wordlist.FRAMEWORKS[j].name,
        'framework',
        req
      );
      if (data) list.push(data);
    }
  if (!req.body.type || req.body.type === 'database')
    for (let j = 0; j < wordlist.DATABASE.length; j++) {
      const data = await countOcurrencies(
        wordlist.DATABASE[j].name,
        'database',
        req
      );
      if (data) list.push(data);
    }

  const totalMentions = list.reduce((a, b) => {
    return a + b.result;
  }, 0);

  list = list.map((f) => ({
    percentage: Math.round((f.result / totalMentions) * 100),
    name: f.name,
    type: f.type,
    result: f.result,
  }));

  res.json(list.sort((a, b) => b.result - a.result));
}

module.exports = {
  getFullJobsPercentage,
  getHistoryLanguage,
  getJobsFromMonthLanguage,
};
