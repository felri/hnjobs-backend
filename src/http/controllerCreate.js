const db = require('../models');
const Jobs = db.jobs;
const wordlist = require('../utils/wordlist');
const fetch = require('node-fetch');

function fixRegex(variation, text) {
  if (variation === 'Cplusplus' && text) return text.split('+').join('plus');
  else if (variation === 'Csharp' && text) return text.split('#').join('sharp');
  else return text;
}

function searchVariations(variations, text) {
  if (variations.length > 0) {
    for (let i = 0; i < variations.length; i++) {
      const regex = new RegExp(`\\b${variations[i]}\\b`, 'i');
      return (m = regex.exec(fixRegex(variations[i], text))) !== null;
    }
  }
}

function getMatchs(arrayJobs, date) {
  let matchs = {};
  for (let i = 0; i < arrayJobs.length; i++) {
    if (searchVariations(['remote'], arrayJobs[i].text))
      matchs[arrayJobs[i].id] = {
        text: arrayJobs[i].text,
        id: arrayJobs[i].id,
        year: date.year,
        month: date.month,
        by: arrayJobs[i].by,
        remote: true,
        languages: [],
      };
    for (let j = 0; j < wordlist.LANGUAGES.length; j++) {
      if (
        searchVariations(wordlist.LANGUAGES[j].variations, arrayJobs[i].text)
      ) {
        if (matchs[arrayJobs[i].id]) {
          matchs[arrayJobs[i].id].languages.push(wordlist.LANGUAGES[j].name);
        } else {
          matchs[arrayJobs[i].id] = {
            text: arrayJobs[i].text,
            id: arrayJobs[i].id,
            year: date.year,
            month: date.month,
            by: arrayJobs[i].by,
            languages: [wordlist.LANGUAGES[j].name],
          };
        }
      }
    }
    for (let j = 0; j < wordlist.DATABASE.length; j++) {
      if (
        searchVariations(wordlist.DATABASE[j].variations, arrayJobs[i].text)
      ) {
        if (matchs[arrayJobs[i].id]) {
          matchs[arrayJobs[i].id].languages.push(wordlist.DATABASE[j].name);
        } else {
          matchs[arrayJobs[i].id] = {
            text: arrayJobs[i].text,
            id: arrayJobs[i].id,
            date,
            by: arrayJobs[i].by,
            languages: [wordlist.DATABASE[j].name],
          };
        }
      }
    }
    for (let j = 0; j < wordlist.FRAMEWORKS.length; j++) {
      if (
        searchVariations(wordlist.FRAMEWORKS[j].variations, arrayJobs[i].text)
      ) {
        if (matchs[arrayJobs[i].id]) {
          matchs[arrayJobs[i].id].languages.push(wordlist.FRAMEWORKS[j].name);
        } else {
          matchs[arrayJobs[i].id] = {
            text: arrayJobs[i].text,
            id: arrayJobs[i].id,
            date,
            by: arrayJobs[i].by,
            languages: [wordlist.FRAMEWORKS[j].name],
          };
        }
      }
    }
  }
  return matchs;
}

async function getJobsFromThread(arrayWithKids) {
  const arrayJobs = [];
  for (let i = 0; i < arrayWithKids.length; i++) {
    try {
      const response = await fetch(
        `${process.env.HACKER_NEWS_URL}${arrayWithKids[i]}.json`
      );
      const data = await response.json();
      console.log(data.id);
      arrayJobs.push(data);
    } catch (e) {
      console.log('could not get comment', e);
    }
  }
  return arrayJobs;
}

async function getThread(threadId) {
  try {
    const response = await fetch(
      `${process.env.HACKER_NEWS_URL}${threadId}.json`
    );
    const data = await response.json();
    return { kids: data.kids, date: formatDate(data.time) };
  } catch (e) {
    console.log('could not get thread', e);
  }
}

function formatDate(unixTime) {
  const date = new Date(unixTime * 1000);
  return { month: date.getMonth(), year: date.getFullYear() };
}

async function saveJobsAndTagsDb(jobsObj) {
  for (let i in jobsObj) {
    try {
      const jobs = new Jobs({ ...jobsObj[i] });
      await jobs.save(jobs);
    } catch (e) {
      console.log(e);
    }
  }
  return;
}

async function main(threadId) {
  const { kids, date } = await getThread(threadId);
  if (kids.length > 0) {
    const arrayJobs = await getJobsFromThread(kids);
    if (arrayJobs.length > 0) {
      const jobs = getMatchs(arrayJobs, date);
      await saveJobsAndTagsDb(jobs);
      return jobs;
    }
  }
}

async function createJobs(req, res) {
  if (req.body.id) {
    const resp = await main(req.body.id);
    res.json(resp);
  } else {
    res.status(400).json({ error: 'no id' });
  }
}

module.exports = {
  createJobs,
};
