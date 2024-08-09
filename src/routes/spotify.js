const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const router = express.Router();
require('dotenv').config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const userId = process.env.SPOTIFY_USER_ID;

router.use(async (req, res, next) => {
    try {
        if (!req.spotifyAccessToken) {
            await refreshAccessToken(req.spotifyRefreshToken);
        }
        next();
    } catch (error) {
        console.error('Error in middleware:', error.message);
        res.status(500).json({ error: 'Failed to refresh access token' });
    }
});

async function refreshAccessToken(refreshToken) {
    if (!refreshToken) {
        console.error('No refresh token available');
        throw new Error('Refresh token is required but missing');
    }

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        },
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    try {
        const response = await axios.post(authOptions.url, querystring.stringify(authOptions.form), {
            headers: authOptions.headers,
        });

        req.spotifyAccessToken = response.data.access_token;
        console.log('New Spotify Access Token:', req.spotifyAccessToken);
    } catch (error) {
        console.error('Error refreshing Spotify access token:', error.response ? error.response.data : error.message);
        throw new Error('Error refreshing Spotify access token');
    }
}

router.post('/create-playlist', async (req, res) => {
    const { spotifyLinks, youtubeLink, videoTitle } = req.body;
    const playlistName = videoTitle;

    try {
        const createPlaylistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${userId}/playlists`,
            JSON.stringify({
                name: playlistName,
                description: 'Playlist created from YouTube video',
                public: false
            }),
            {
                headers: {
                    'Authorization': `Bearer ${req.spotifyAccessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const playlistId = createPlaylistResponse.data.id;
        console.log('Created Spotify Playlist ID:', playlistId);

        const trackUris = spotifyLinks.map(url => `spotify:track:${url.split('/track/')[1].split('?')[0]}`);

        if (trackUris.length > 0) {
            await axios.post(
                `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
                JSON.stringify({ uris: trackUris }),
                {
                    headers: {
                        'Authorization': `Bearer ${req.spotifyAccessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Tracks added to Spotify Playlist');
        }

        res.json({ message: 'Spotify Playlist created successfully', playlistId });
    } catch (error) {
        console.error('Error creating Spotify playlist:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(500).json({ error: error.response ? error.response.data : 'Error creating Spotify playlist' });
    }
});

module.exports = router;
