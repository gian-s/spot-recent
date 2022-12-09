const SpotifyWebApi = require("spotify-web-api-node");
require("dotenv").config();
const pathToenvFile = "../.env";
require("dotenv").config({ path: pathToenvFile });

async function createRecent(access_token, playlist_name = "RECENTLY PLAYED") {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET,
  });
  await spotifyApi.setAccessToken(access_token);

  //getuser id -> get list of playlists -> check if playlist has been created --> if so delete it and create new one --> if not create it
  try {
    const user = await spotifyApi.getMe().then((data) => {
      const res = spotifyApi
        .getUserPlaylists(data.body.id, { limit: 50 })
        .then((data) => {
          const ret = data.body.items.map((item) => {
            return {
              id: item.id,
              name: item.name,
            };
          });
          //console.log(ret);
          var recent_id = "";
          for (var i = 0; i < ret.length; i++) {
            if (ret[i].name === playlist_name) {
              console.log(ret[i].name);
              recent_id = ret[i].id;
              break;
            }
          }
          console.log(recent_id);
          if (recent_id !== "") {
            //remove all songs in playlist
            const track_array = ret.map((item) => {
              return "spotify:track:".concat(item.id);
            });
            console.log(track_array);
            //spotifyApi.removeTracksFromPlaylist(recent_id,)
          } else {
            //create new one
            console.log("Create PLaylist");
          }
        });
    });
  } catch (error) {
    console.log("Error getting user");
    console.log(error);
  }
}

async function getData(access_token, playlist_name = "RECENTLY PLAYED TRACKS") {
  //return
  await createRecent(access_token, playlist_name); //creates playlist

  //get playlist-id
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
  getData,
};
