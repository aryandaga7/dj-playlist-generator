# DJ Playlist Generator

DJ Playlist Generator is a web application that allows users to generate Spotify playlists from songs identified in YouTube videos. By inputting a YouTube link, the application analyzes the video, identifies the songs using the Audd.io API, and then creates a corresponding Spotify playlist.

## Features

- Identify songs from YouTube DJ sets using the AudD API.
- Create Spotify playlists with identified songs.
- Automate the entire process with a simple interface.

## Project Structure
```
dj-playlist-generator/
├── public/
│   ├── index.html
│   ├── styles.css
├── src/
│   ├── app.js
│   ├── routes/
│   │   ├── youtube.js
│   │   ├── shazam.js
│   │   ├── spotify.js
├── package.json
└── README.md
```

```
public/: Contains the front-end files.
  index.html: Main HTML file.
  styles.css: Styles for the front-end.
src/: Contains the back-end code.
  app.js: Main server file.
  routes/: Contains the route handlers.
  youtube.js: Handles YouTube link processing.
  audd.js: Interacts with the AudD API to identify songs.
  spotify.js: Handles Spotify API interactions.
package.json: Project dependencies and scripts.
README.md: Project documentation.
```

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/aryandaga7/dj-playlist-generator.git
   cd dj-playlist-generator

2. Install the dependencies:
   npm install

## Usage

1. Start the server:
   ```
   npm start
   ```

2. Open your browser and go to http://localhost:3000/login to log in with your Spotify account and authorize the application.

3. Input a YouTube link and generate your Spotify playlist.


## Screenshots

<img width="1512" alt="dj-web" src="https://github.com/user-attachments/assets/1538cf57-9425-4185-8ec9-87eeb755e739">
<img width="1512" alt="dj-spotify" src="https://github.com/user-attachments/assets/f26f8f61-d628-44d9-a0d6-ce8a78f04b7f">



