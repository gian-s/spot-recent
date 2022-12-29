import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import axios from "axios";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  //const [playlists, setPlaylists] = useState([]);
  //const [tracks, setTracks] = useState({});

  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      axios
        .post("http://localhost:3001/recently-played", {
          accessToken,
        })
        .then((res) => {
          //console.log(res.data);
        })
        .catch((error) => {
          console.log(error);
        });
    }, 10000); //every 5 min
    return () => clearInterval(interval);
  }, [accessToken]);

  //console.log(playlists);

  return (
    <div>
      <h1>YOU HAVE LOGGED IN !!!</h1>
    </div>
  );
}
