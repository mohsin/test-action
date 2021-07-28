const core  = require('@actions/core');

try {
  // `who-to-greet` input defined in action metadata file
  const instagramId = core.getInput('instagram-id');
  const instagramAccessToken = core.getInput('instagram-access-token');
  const URL = 'https://graph.instagram.com/v11.0/' + instagramId + '/media?access_token=' + instagramAccessToken;
  fetch(URL,  init:{method: 'GET', headers:{}})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.log(error));
  const time = (new Date()).toTimeString();
  core.setOutput("time", time);
} catch (error) {
  core.setFailed(error.message);
}