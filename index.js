const core = require('@actions/core');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const { exec } = require('shelljs');

function commitAndPush (
  message,
  name = "Instagram",
  email = "instagram-bot@users.noreply.github.com"
) {
  exec(`git config --global user.email "${email}"`);
  exec(`git config --global user.name "${name}"`);
  exec(`git add .`);
  exec(`git commit -m "${message.replace(/\"/g, "''")}"`);
  const result = exec("git push");
  if (result.includes("error:")) throw new Error(result);
};

const instagramId = core.getInput('instagram-id');
const instagramAccessToken = core.getInput('instagram-access-token');
const targetPath = core.getInput('target-path');

var promises = [];
var resultsMap = new Object(null);

const URL = 'https://graph.instagram.com/v11.0/' + instagramId + '/media?access_token=' + instagramAccessToken;
fetch(URL)
.then(response => response.json())
.then(response => {
  results = response.data.slice(0, 4).map(item => Object.defineProperty(resultsMap, item.id, {value : null, writable : true, enumerable : true, configurable : true}))
  response.data.slice(0, 4).forEach(item => {
    promises.push(fetch('https://graph.instagram.com/' + item.id + '?fields=caption,media_type,media_url,permalink&access_token=' + instagramAccessToken).then(result => result.json()))
  })
})
.then(() => {
  return Promise.allSettled(promises);
})
.then((results) => results.forEach(item => {
  resultsMap[item.value.id] = item.value.media_url
}))
.then(() => {
  fs.outputJson(targetPath, resultsMap)
  .then(() => commitAndPush(`chore: Updated ${targetPath.split(/[\\/]/).pop()} with the Instagram API`))
})
.catch(error => core.setFailed(error.message));
