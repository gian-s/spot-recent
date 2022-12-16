const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();
const pathToenvFile = "../.env";
require("dotenv").config({ path: pathToenvFile });

async function getRecentPlaylist(access_token, playlist_name) {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  });

  await spotifyApi.setAccessToken(access_token);

  const user_id = await spotifyApi.getMe();

  const current_playlists = await spotifyApi.getUserPlaylists(user_id.body.id, {
    limit: 50,
  });

  var ret = current_playlists.body.items.map((item) => {
    return {
      id: item.id,
      name: item.name,
    };
  });

  for (var i = 0; i < ret.length; i++) {
    var recent_id = "";
    if (ret[i].name === playlist_name) {
      recent_id = ret[i].id;
      console.log(ret[i].name);
      console.log(recent_id);
      return recent_id;
    }
  }
  console.log("recent id is blank");
  console.log(recent_id);
  return recent_id;
}

async function checkRecentPlaylist(access_token, playlist_name, recent_id) {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  });

  await spotifyApi.setAccessToken(access_token);

  if (recent_id !== "") {
    //remove all songs
    const toRemove = await spotifyApi.getPlaylistTracks(recent_id, {
      limit: 50,
    });
    console.log("Got Tracks to Remove");
    const toRemove_array = toRemove.body.items.map((item) => {
      return { uri: "spotify:track:".concat(item.track.id) };
    });
    console.log(toRemove_array);
    await spotifyApi.removeTracksFromPlaylist(recent_id, toRemove_array);
    console.log("Tracks Were Removed");
    return recent_id;
  } else {
    console.log("CREATING NEW PLAYLIST");
    const newPlaylist = await spotifyApi.createPlaylist(playlist_name, {
      collaborative: false,
      public: true,
    });
    return newPlaylist.body.id;
  }
}

async function addRecentTracks(access_token, recent_id) {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  });
  await spotifyApi.setAccessToken(access_token);

  const recentTracks = await spotifyApi.getMyRecentlyPlayedTracks({
    limit: 50,
  });
  //console.log(recentTracks);

  const recentArray = recentTracks.body.items.map((item) => {
    return "spotify:track:".concat(item.track.id);
  });
  //console.log(recentArray);

  try {
    spotifyApi.addTracksToPlaylist(recent_id, recentArray);
    console.log("RECENTLY PLAYED HAS BEEN UPDATED");
    return recentArray;
  } catch (error) {
    console.log(error);
  }
}

async function createRecentPlaylist(
  access_token,
  playlist_name = "RECENTLY PLAYED"
) {
  //return
  var recent_id = await getRecentPlaylist(access_token, playlist_name); //creates playlist
  recent_id = await checkRecentPlaylist(access_token, playlist_name, recent_id);
  const newTrack = await addRecentTracks(access_token, recent_id);

  return newTrack;
}
//get playlist id  --> get recently played tracks --> add tracks to given playlist id
//   await spotifyApi
//     .getMyRecentlyPlayedTracks({
//       limit: 50,
//     })
//     .then(
//        (data) => {
//         // Output items
//         console.log("Your 50 most recently played tracks are:");
//         ret = data.body.items.map((item) =>
//           "spotify:track:".concat(item.track.id)
//         );
//         return ret;
//       },
//        (err) => {
//         console.log("Something went wrong!", err);
//       }
//     );

//   await spotifyApi
//     .addTracksToPlaylist(process.env.REACT_APP_RECENT_PLAYLIST, ret)
//     .then(
//        (data) => {
//         console.log("Added tracks to playlist!");
//       },
//        (err) =>{
//         console.log("Something went wrong!", err);
//       }
//     );
// }

module.exports = {
  createRecentPlaylist,
};
