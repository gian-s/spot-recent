import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import axios from "axios";
import "./Dashboard.css";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid";

import getTrackInfo from "./getTrackInfo";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  //const [playlists, setPlaylists] = useState([]);
  //const [token, setToken] = useState(accessToken);
  const [currTrack, setcurrTrack] = useState({
    albumName: "",
    artists: "Artist",
    trackName: "Hello",
    trackImg:
      "https://www.citypng.com/public/uploads/preview/square-black-green-spotify-app-icon-png-11661939923qllpspxn3s.png",
  });

  const [currFeats, setcurrFeats] = useState({
    bpm: 0,
    dance: 0,
    energy: 0,
    key: 0,
  });
  //console.log(token);
  useEffect(() => {
    console.log(accessToken);
    if (!accessToken) {
      console.log("useEffect in Dashboard returned");
      return;
    }
    const interval = setInterval(() => {
      axios
        .post("http://localhost:3001/recently-played", {
          accessToken,
        })
        .then((res) => {
          console.log(res.data);
          if (res.data.track_img) {
            let artistsArr = res.data.artists.split(",");
            let newArtists = artistsArr.join(", ");
            setcurrTrack({
              albumName: res.data.album_name,
              artists: newArtists,
              trackImg: res.data.track_img,
              trackName: res.data.name,
            });

            const info = getTrackInfo(accessToken, res.data.id).then((res) => {
              console.log(res);
              setcurrFeats({
                bpm: res.bpm,
                dance: res.dance,
                energy: res.energy,
                key: res.key,
              });
            });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }, 10000); //every 5 min
    return () => clearInterval(interval);
  }, [accessToken, currTrack]);

  //console.log(playlists);
  //const alt_img

  return (
    <div className="container">
      <div className="centered-image">
        <Card sx={{ maxWidth: 450 }}>
          <CardActionArea>
            <CardMedia
              component="img"
              height="450"
              image={currTrack.trackImg}
              alt="green iguana"
            />
            <CardContent>
              <Typography variant="h5" align="left">
                {currTrack.trackName}
              </Typography>

              <Typography
                variant="body2"
                //align="right"
                color="text.secondary"
              >
                {currTrack.artists}
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </div>
    </div>
  );
}
