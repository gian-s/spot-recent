const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();
const pathToenvFile = "../client/.env";
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
    //console.log(playback);
    if (playback.statusCode == 200) {
      //var datetime = new Date();
      var entry = {
        statusCode: playback.statusCode,
        is_playing: playback.body.is_playing,
        artists: playback.body.item.artists
          .map((item) => {
            return item.name;
          })
          .join(","),
        name: playback.body.item.name,
        id: playback.body.item.id,
        progress: Number(
          (playback.body.progress_ms / playback.body.item.duration_ms).toFixed(
            3
          )
        ),
        progress_ms: playback.body.progress_ms,
        duration_ms: playback.body.item.duration_ms,
        album_id: playback.body.item.album.uri.slice(14),
        album_name: playback.body.item.album.name,
        track_img: playback.body.item.album.images[0].url,
      };
    } else {
      var entry = { statusCode: playback.statusCode };
    }
    return entry;
  } catch (error) {
    console.log(error);
  }

  //ping spotify server check if music is playing, if playing add song details to sql table
}

module.exports = {
  getPlayback,
};
