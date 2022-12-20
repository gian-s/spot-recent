const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();
const pathToenvFile = "../.env";
require("dotenv").config({ path: pathToenvFile });

async function getPlayback(access_token) {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  });
  await spotifyApi.setAccessToken(access_token);

  try {
    const playback = await spotifyApi.getMyCurrentPlaybackState();
    console.log(playback);
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  getPlayback,
};
