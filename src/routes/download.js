const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/', async (req, res) => {
    const { playlistLink } = req.body;

    try {
        // Logic to automate download from external site using a headless browser
        const response = await axios.post('https://spotify-downloader.com/api/download', {
            link: playlistLink,
        });

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Error downloading playlist' });
    }
});

module.exports = router;
