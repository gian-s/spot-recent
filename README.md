# spot-recent
Small web app to keep track of your spotify listening history. Connect a SQL database to store information.

# About the Spotify API

You will need to create an application on the spotify developers platform
https://developer.spotify.com/dashboard/login

You will need your client_id and client_secret to use the application

# Get Started

1. Clone repository
2. Create .env file in spot-recent/app/ and fill out template provided in `env.md`
3. run the following command `cd spot-recent/app/; npm i; cd spot-recent/app/server;npm i`
4. Start the development server `npm start` and `node server/server.js`
5. Playlist will be created and if already is created will be updated!

Fully Functional Web App coming soon !!!


# Listening on your devices
If you listen to 50% of a song then it should be included in your history, someitmes spotify's own history feature
or even spotify wrapped seems wildly inaccurate. This application is an attempt at trying to take ownership of your listening data. 
