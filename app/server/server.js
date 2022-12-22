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

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password",
  port: "3306",
});

db.connect((err) => {
  if (err) {
    //console.log(err);
    throw err;
  }

  console.log("MySQL Connected...");
});
//create database
app.get("/createdb", (req, res) => {
  let sql = "CREATE DATABASE spotrecent";

  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("database created...");
  });
});
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

app.post(
  "/recently-played",
  asyncHandler(async (req, res) => {
    //console.log(req.body.accessToken);
    console.log(req.body.state.position);
    // const access_token = req.body.accessToken;
    // var recent_tracks = await createRecentPlaylist(access_token);
    // console.log(recent_tracks);

    if (
      req.body.state != null &&
      !req.body.state.paused &&
      req.body.state.position <= 10
    ) {
      curr_track = req.body.state.track_window.current_track;
      //console.log(curr_track);
      //add song to database
      entry = {
        id: req.body.state.track_window.current_track.id,
        uri: req.body.state.track_window.current_track.uri,
        name: req.body.state.track_window.current_track.name,
        artists: req.body.state.track_window.current_track.artists
          .map((item) => {
            return item.name;
          })
          .join(","),
        album: req.body.state.track_window.current_track.album.name,
        album_uri: req.body.state.track_window.current_track.album.name,
      };
      console.log(entry);
    }
    res.json({
      message: "State Change",
    });
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
      //console.log(data.body);
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
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
