const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();
const pathToenvFile = "../.env";
require("dotenv").config({ path: pathToenvFile });

async function getData(access_token) {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  });
  await spotifyApi.setAccessToken(access_token);
  var ret = null;
  await spotifyApi
    .getMyRecentlyPlayedTracks({
      limit: 50,
    })
    .then(
      function (data) {
        // Output items
        console.log("Your 50 most recently played tracks are:");
        ret = data.body.items.map((item) =>
          "spotify:track:".concat(item.track.id)
        );
        return ret;
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
  await spotifyApi
    .addTracksToPlaylist(process.env.REACT_APP_RECENT_PLAYLIST, ret)
    .then(
      function (data) {
        console.log("Added tracks to playlist!");
      },
      function (err) {
        console.log("Something went wrong!", err);
      }
    );
}

module.exports = {
  getData,
};
