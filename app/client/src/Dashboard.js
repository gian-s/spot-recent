import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import axios from "axios";
import "./Dashboard.css";

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  //const [playlists, setPlaylists] = useState([]);
  //const [tracks, setTracks] = useState({});
  const [currTrack, setcurrTrack] = useState("");
  useEffect(() => {
    if (!accessToken) return;
    const interval = setInterval(() => {
      axios
        .post("http://localhost:3001/recently-played", {
          accessToken,
        })
        .then((res) => {
          console.log(res.data);
          setcurrTrack(res.data.track_img);
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
    <div className="centered">
      <img src={currTrack} alt="track" height={450} width={450} />
    </div>
  );
}
