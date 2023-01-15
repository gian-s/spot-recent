const express = require("express");
const fs = require("fs");
const cors = require("cors");
const SpotifyWebApi = require("spotify-web-api-node");
const bodyParser = require("body-parser");
const { parse, stringify } = require("envfile");
const pathToenvFile = "../client/.env";
const asyncHandler = require("express-async-handler");
const { createRecentPlaylist } = require("./getRecent");
const { getPlayback } = require("./getPlaybackState");
const mysql = require("mysql");

require("dotenv").config({ path: pathToenvFile });
const app = express();
app.use(cors());
app.use(bodyParser.json());

//.env file located in parent directory edit this location path if moved

var generateRandomString = function (length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var scopes = process.env.REACT_APP_SCOPES.split(" "),
  redirectUri = process.env.REACT_APP_REDIRECT_URI,
  clientId = process.env.REACT_APP_CLIENT_ID,
  state = generateRandomString(16);

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi({
  redirectUri: redirectUri,
  clientId: clientId,
});

// Create the authorization URL
const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

function setEnv(key, value) {
  fs.readFile(pathToenvFile, "utf8", function (err, data) {
    if (err) {
      return console.log(err);
    }
    var result = parse(data);
    result[key] = value;
    //console.log(result);
    fs.writeFile(pathToenvFile, stringify(result), function (err) {
      if (err) {
        return console.log(err);
      }
      //console.log("File Saved"); // Can be commented or deleted
    });
  });
}
//Calls function and sets environment variables needed to call Spotify's API
setEnv("REACT_APP_APP_URL", authorizeURL);

var con = mysql.createConnection({
  host: process.env.RDS_HOSTNAME,
  user: process.env.RDS_USERNAME,
  password: process.env.RDS_PASSWORD,
  database: process.env.RDS_NAME,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});
//   console.log("MySQL Connected...");
// });
// //create database
// app.get("/createdb", (req, res) => {
//   let sql = "CREATE DATABASE spotrecent";

//   db.query(sql, (err, result) => {
//     if (err) throw err;
//     console.log(result);
//     res.send("database created...");
//   });
// });
//create table
// app.get('/createtable',(req,res)=>{
//   let sql = 'CREATE TABLE tracks()';
// })

//Handles login route

app.post(
  "/login",
  asyncHandler(async (req, res) => {
    const spotifyApi = new SpotifyWebApi({
      redirectUri: process.env.REACT_APP_REDIRECT_URI,
      clientId: process.env.REACT_APP_CLIENT_ID,
      clientSecret: process.env.REACT_APP_CLIENT_SECRET,
    });

    const code = req.body.code;
    spotifyApi.authorizationCodeGrant(code).then((data) => {
      //console.log(data.body.access_token);
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });

      //const playback = getPlayback(data.body.access_token);
      //console.log(data.body.expires_in);
    });
  })
);

var stack = [];

app.post(
  "/recently-played",
  asyncHandler(async (req, res) => {
    //console.log(req.body.accessToken);
    //console.log(req.body);
    const access_token = await req.body.accessToken;
    // var recent_tracks = await createRecentPlaylist(access_token);
    // console.log(recent_tracks)
    const state = await getPlayback(access_token);

    console.log(state);

    // if status code is good and not paused and past a certain percentage of the song
    // if status code is good and paused then do nothing if status code is not good then do nothing either
    if (state.statusCode === 200 && state.is_playing === true) {
      //create an array
      //push the percentage of the song that has been completed

      //base case when server is starting up again
      if (stack.length === 0) {
        //if stack is empty just push to array
        stack.push({
          id: state.id,
          progress: state.progress,
          progress_ms: state.progress_ms,
          added: false,
        });
        stack.push({
          id: state.id,
          progress: state.progress,
          progress_ms: state.progress_ms,
          added: false,
        });
      }

      //new song
      if (stack[1].id === state.id) {
        //same song keep playing

        if (stack[1].progress > state.progress) {
          //this means that someon scrubbed back
          //then we want to set back
          stack[0].progress = state.progress;
          stack[1].progress = state.progress;
          stack[0].progress_ms = state.progress_ms;
          stack[1].progress_ms = state.progress_ms;
          stack[0].added = false;
          stack[1].added = false;

        } else if (state.progress_ms > stack[1].progress_ms + 20000) {

          stack[0].progress = state.progress;
          stack[1].progress = state.progress;
          stack[0].progress_ms = state.progress_ms;
          stack[1].progress_ms = state.progress_ms;
          stack[0].added = false;
          stack[1].added = false;
        } else {
          stack[1].id = state.id;
          stack[1].progress = state.progress;
          stack[1].progress_ms = state.progress_ms;
        }
      } else if (stack[1].id !== state.id) {
        //new song we want to clear our stack and update it with new song info
        stack.length = 0;
        stack.push({
          id: state.id,
          progress: state.progress,
          progress_ms: state.progress_ms,
          added: false,
        });
        stack.push({
          id: state.id,
          progress: state.progress,
          progress_ms: state.progress_ms,
          added: false,
        });
      }

      if (stack[1].progress - stack[0].progress > 0.35 && !stack[1].added) {
        stack[1].added = true;
        toInsert = {
          trackId: state.id,
          artists: state.artists,
          trackName: state.name,
          trackDuration: state.duration_ms,
          albumId: state.album_id,
          albumName: state.album_name,
          trackImg: state.track_img,
        };

        var sql = "INSERT INTO recentlyPlayed SET ?";
        con.query(sql, toInsert, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });
      }
      // if the song is the same, and the current progress is what the song would be like after prev_progress + 30 sec
      // then we know that the song was repeated
      // or more like if the previous song was already past the threshold and then the song goes again but the progress goes back
      // and is past the threshold but before another threshold then it should count again
      // I'm not really one that repeats songs over and over again but i do play songs multiple times in one session
      // theres many ways of thinking about how a song should count as a valid "play" and this would add to how accurate your spotify recap would be
      // }
      console.log(stack);
    } else if (
      state.statusCode === 200 &&
      state.is_playing === false &&
      stack.length === 2
    ) {
      stack[1].progress = state.progress;
      stack[1].progress_ms = state.progress_ms;
    } else {
      console.log(state);
    }
    res.json(state);
  })
);

app.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REACT_APP_REDIRECT_URI,
    clientId: process.env.REACT_APP_CLIENT_ID,
    clientSecret: process.env.REACT_APP_CLIENT_SECRET,
    refreshToken,
  });
  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      console.log("Refresh End Point Hit");
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

var listener = app.listen(3001, function () {
  console.log("Listening on port " + listener.address().port); //Listening on port 8888
});
