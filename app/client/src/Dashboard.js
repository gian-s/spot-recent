import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import axios from "axios";

const track = {
  name: "",
  album: {
    images: [{ url: "" }],
  },
  artists: [{ name: "" }],
};

export default function Dashboard({ code }) {
  const accessToken = useAuth(code);
  const [playlists, setPlaylists] = useState([]);
  const [tracks, setTracks] = useState({});

  const [player, setPlayer] = useState(undefined);
  const [is_paused, setPaused] = useState(false);
  const [is_active, setActive] = useState(false);
  const [current_track, setTrack] = useState(track);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      setPlayer(player);

      player.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", (state) => {
        if (!state) {
          return;
        }

        setTrack(state.track_window.current_track);
        setPaused(state.paused);

        player.getCurrentState().then((state) => {
          axios
            .post("http://localhost:3001/recently-played", {
              state,
            })
            .then((res) => {
              console.log(res.data);
            })
            .catch((error) => {
              console.log(error);
            });

          // console.log(state);
          // console.log(state.paused);
          // console.log(state.track_window.current_track);
          !state ? setActive(false) : setActive(true);
        });
      });

      player.connect();
    };
  }, [accessToken]);

  // useEffect(() => {
  //   if (!accessToken) return;
  //   const interval = setInterval(() => {
  //     axios
  //       .post("http://localhost:3001/recently-played", {
  //         accessToken,
  //       })
  //       .then((res) => {
  //         //console.log(res.data);
  //       })
  //       .catch((error) => {
  //         console.log(error);
  //       });
  //   }, 60000); //every 5 min
  //   return () => clearInterval(interval);
  // }, [accessToken]);

  //console.log(playlists);

  if (!is_active) {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <b>
              {" "}
              Instance not active. Transfer your playback using your Spotify app{" "}
            </b>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <>
        <div className="container">
          <div className="main-wrapper">
            <img
              src={current_track.album.images[0].url}
              className="now-playing__cover"
              alt=""
            />

            <div className="now-playing__side">
              <div className="now-playing__name">{current_track.name}</div>
              <div className="now-playing__artist">
                {current_track.artists[0].name}
              </div>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.previousTrack();
                }}
              >
                &lt;&lt;
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.togglePlay();
                }}
              >
                {is_paused ? "PLAY" : "PAUSE"}
              </button>

              <button
                className="btn-spotify"
                onClick={() => {
                  player.nextTrack();
                }}
              >
                &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}
