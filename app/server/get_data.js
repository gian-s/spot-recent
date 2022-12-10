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
      const user_id = data.body.id;

      spotifyApi.getUserPlaylists(user_id, { limit: 50 }).then((data) => {
        var ret = data.body.items.map((item) => {
          return {
            id: item.id,
            name: item.name,
          };
        });

        for (var i = 0; i < ret.length; i++) {
          var recent_idp = "";
          if (ret[i].name === playlist_name) {
            recent_idp = ret[i].id;
            console.log(ret[i].name);
            console.log(playlist_name);

            break;
          } else {
          }
        }

        try {
          spotifyApi
            .getMyRecentlyPlayedTracks({
              limit: 50,
            })
            .then((data) => {
              const track_array = data.body.items.map((item) => {
                return "spotify:track:".concat(item.track.id);
              });
              console.log(track_array);

              if (recent_idp !== "") {
                try {
                  spotifyApi
                    .getPlaylistTracks(recent_idp, { limit: 50 })
                    .then((data) => {
                      const recent_array = data.body.items.map((item) => {
                        return { uri: "spotify:track:".concat(item.track.id) };
                      });

                      console.log(recent_array);
                      spotifyApi
                        .removeTracksFromPlaylist(recent_idp, recent_array)
                        .then((data) => {
                          spotifyApi.addTracksToPlaylist(
                            recent_idp,
                            track_array
                          );
                        });
                    });
                } catch (error) {
                  console.log(error);
                }
              } else {
                console.log("create new playlist");
                spotifyApi
                  .createPlaylist(playlist_name, {
                    collaborative: false,
                    public: true,
                  })
                  .then((data) => {
                    recent_idp = data.body.id;
                    console.log(recent_idp);
                    spotifyApi.addTracksToPlaylist(recent_idp, track_array);
                  });
              }
            });
        } catch (error) {
          console.log(error);
        }
      });

      //create new set of recently played tracks/use it to populate new playlist
    });
  } catch (error) {
    console.log("Error getting user");
    console.log(error);
  }
}

async function getData(access_token, playlist_name = "RECENTLY PLAYED") {
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
