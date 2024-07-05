const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
    const youtubeLink = req.body.youtubeLink;

    console.log('YouTube Link received:', youtubeLink);

    try {
        const response = await axios.post('http://localhost:3000/audd', { youtubeLink });
        const { spotifyLinks, youtubeLink: ytLink } = response.data;

        console.log('Songs identified:', spotifyLinks);

        if (spotifyLinks.length > 0) {
            const spotifyResponse = await axios.post('http://localhost:3000/spotify/create-playlist', { spotifyLinks, youtubeLink: ytLink });
            res.json(spotifyResponse.data);
        } else {
            res.status(400).json({ error: 'No songs identified' });
        }
    } catch (error) {
        console.error('Error processing YouTube link:', error);
        res.status(500).json({ error: 'Error processing YouTube link' });
    }
});

module.exports = router;
