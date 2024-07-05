const express = require('express');
const axios = require('axios');
const router = express.Router();

const client_id = 'f5444228ca1a48d2acb386cbfa39d8e3'; // Your Client ID
const client_secret = '696634cabebe467185ce6a57445ae3f2'; // Your Client Secret

let spotifyAccessToken = ''; // Dynamically set by app.js
let spotifyRefreshToken = ''; // Dynamically set by app.js

// Middleware to refresh the token if needed
router.use(async (req, res, next) => {
    if (!spotifyAccessToken) {
        // Attempt to use refresh token
        const authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                grant_type: 'refresh_token',
                refresh_token: spotifyRefreshToken
            },
            headers: {
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
            }
        };

        try {
            const response = await axios.post(authOptions.url, querystring.stringify(authOptions.form), {
                headers: authOptions.headers,
            });

            spotifyAccessToken = response.data.access_token;
            console.log('New Access Token:', spotifyAccessToken);
        } catch (error) {
            console.error('Error refreshing access token:', error);
            return res.status(500).json({ error: 'Unable to refresh access token' });
        }
    }
    next();
});

router.post('/create-playlist', async (req, res) => {
    const { spotifyLinks, youtubeLink } = req.body;
    const playlistName = `YouTube Playlist: ${new URL(youtubeLink).hostname}`;

    try {
        // Create a new playlist
        const createPlaylistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                name: playlistName,
                description: 'Playlist created from YouTube video',
                public: false
            },
            {
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const playlistId = createPlaylistResponse.data.id;

        // Add tracks to the playlist
        const addTracksResponse = await axios.post(
            `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
            {
                uris: spotifyLinks
            },
            {
                headers: {
                    'Authorization': `Bearer ${spotifyAccessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        res.json({ message: 'Playlist created successfully', playlistId });
    } catch (error) {
        console.error('Error creating playlist:', error);
        res.status(500).json({ error: 'Error creating playlist' });
    }
});

module.exports = router;
