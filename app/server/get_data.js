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
    console.log(toRemove);
    const toRemove_array = toRemove.body.items.map((item) => {
      return { uri: "spotify:track:".concat(item.track.id) };
    });
    console.log(toRemove_array);
    await spotifyApi.removeTracksFromPlaylist(recent_id, toRemove_array);
    return recent_id;
  } else {
    console.log("create new playlist");
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
  console.log(recentTracks);

  const recentArray = recentTracks.body.items.map((item) => {
    return "spotify:track:".concat(item.track.id);
  });
  console.log(recentArray);

  try {
    spotifyApi.addTracksToPlaylist(recent_id, recentArray);
    console.log("Tracks Have been Added");
    return recentArray;
  } catch (error) {
    console.log(error);
  }
}

// async function createRecent(access_token, playlist_name = "RECENTLY PLAYED") {
//   const spotifyApi = new SpotifyWebApi({
//     redirectUri: process.env.REACT_APP_REDIRECT_URI,
//     clientId: process.env.REACT_APP_CLIENT_ID,
//     clientSecret: process.env.REACT_APP_CLIENT_SECRET,
//   });
//   await spotifyApi.setAccessToken(access_token);

//   //getuser id -> get list of playlists -> check if playlist has been created --> if so delete it and create new one --> if not create it

//   try {
//     const user = await spotifyApi.getMe().then((data) => {
//       const user_id = data.body.id;

//       spotifyApi.getUserPlaylists(user_id, { limit: 50 }).then((data) => {
//         var ret = data.body.items.map((item) => {
//           return {
//             id: item.id,
//             name: item.name,
//           };
//         });

//         for (var i = 0; i < ret.length; i++) {
//           var recent_idp = "";
//           if (ret[i].name === playlist_name) {
//             recent_idp = ret[i].id;
//             console.log(ret[i].name);
//             console.log(playlist_name);

//             break;
//           } else {
//           }
//         }

//         try {
//           spotifyApi
//             .getMyRecentlyPlayedTracks({
//               limit: 50,
//             })
//             .then((data) => {
//               const track_array = data.body.items.map((item) => {
//                 return "spotify:track:".concat(item.track.id);
//               });
//               console.log(track_array);

//               if (recent_idp !== "") {
//                 try {
//                   spotifyApi
//                     .getPlaylistTracks(recent_idp, { limit: 50 })
//                     .then((data) => {
//                       const recent_array = data.body.items.map((item) => {
//                         return { uri: "spotify:track:".concat(item.track.id) };
//                       });

//                       console.log(recent_array);
//                       spotifyApi
//                         .removeTracksFromPlaylist(recent_idp, recent_array)
//                         .then((data) => {
//                           spotifyApi.addTracksToPlaylist(
//                             recent_idp,
//                             track_array
//                           );
//                         });
//                     });
//                 } catch (error) {
//                   console.log(error);
//                 }
//               } else {
//                 console.log("create new playlist");
//                 spotifyApi
//                   .createPlaylist(playlist_name, {
//                     collaborative: false,
//                     public: true,
//                   })
//                   .then((data) => {
//                     recent_idp = data.body.id;
//                     console.log(recent_idp);
//                     spotifyApi.addTracksToPlaylist(recent_idp, track_array);
//                   });
//               }
//             });
//         } catch (error) {
//           console.log(error);
//         }
//       });

//       //create new set of recently played tracks/use it to populate new playlist
//     });
//   } catch (error) {
//     console.log("Error getting user");
//     console.log(error);
//   }
// }

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

module.exports = {
  createRecentPlaylist,
};
