# DJ Playlist Generator

DJ Playlist Generator is a web application that takes a YouTube link of a DJ set, identifies each song using the AudD API, and then creates a Spotify playlist with those songs.

## Features

- Identify songs from YouTube DJ sets using the AudD API.
- Create Spotify playlists with identified songs.
- Automate the entire process with a simple interface.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/dj-playlist-generator.git
   cd dj-playlist-generator

2. Install the dependencies:
   npm install

3. Set up your environment variables. Create a .env file in the root directory with the following contents:
   ```
   CLIENT_ID=your_spotify_client_id
   CLIENT_SECRET=your_spotify_client_secret
   REDIRECT_URI=http://localhost:3000/callback
   AUDD_API_KEY=your_audd_api_key
   YOUTUBE_API_KEY=your_youtube_api_key
   ```

## Usage

1. Start the server:
   ```
   node src/app.js
   ```

2. Open your browser and go to http://localhost:3000/login to log in with your Spotify account and authorize the application.

3. Once authorized, you will be redirected back to the application.

4. Enter the YouTube link of the DJ set into the provided form and submit.

5. The application will process the YouTube link, identify the songs, and create a Spotify playlist.

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

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any changes.

1. Fork the repository.
2. Create a new branch: git checkout -b my-branch-name.
3. Make your changes and commit them: git commit -m 'Add some feature'.
4. Push to the branch: git push origin my-branch-name.
5. Submit a pull request.




