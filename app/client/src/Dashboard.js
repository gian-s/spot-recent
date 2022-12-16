import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";

const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.REACT_APP_REDIRECT_URI,
  clientId: process.env.REACT_APP_CLIENT_ID,
  clientSecret: process.env.REACT_APP_CLIENT_SECRET,
});

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  //const [playlists, setPlaylists] = useState([]);
  //const [tracks, setTracks] = useState({});

  useEffect(() => {
    if (!accessToken) return;
    spotifyApi.setAccessToken(accessToken);
    axios
      .post("http://localhost:3001/recently-played", {
        accessToken,
      })
      .then((res) => {
        console.log(res);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [accessToken]);

  //console.log(playlists);

  return (
    <div>
      <h1>YOU HAVE LOGGED IN !!!</h1>
    </div>
  );
}
