const SpotifyWebApi = require("spotify-web-api-node");

async function getTrackInfo(access_token, track_id) {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  });

  await spotifyApi.setAccessToken(access_token);

  const info = await spotifyApi.getAudioFeaturesForTrack(track_id);
  //console.log(info.body);
  return {
    dance: info.body.danceability,
    energy: info.body.energy,
    bpm: info.body.tempo,
    key: info.body.key,
  };
}

export default getTrackInfo;
