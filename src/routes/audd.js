const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const puppeteer = require('puppeteer');
const router = express.Router();

const youtubeApiKey = 'AIzaSyBYD4PbujzEi_fwH6BX4jB9ImnIj0s04Eg'; // Replace with your YouTube API key
const auddApiKey = '431a6d570c107e34076543a0dbff36aa';
const interval = 40; // seconds

async function getYouTubeVideoDuration(videoId) {
    const youtube = google.youtube({
        version: 'v3',
        auth: youtubeApiKey
    });

    const response = await youtube.videos.list({
        part: 'contentDetails',
        id: videoId
    });

    const duration = response.data.items[0].contentDetails.duration;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    let seconds = 0;
    if (match[1]) seconds += parseInt(match[1]) * 3600;
    if (match[2]) seconds += parseInt(match[2]) * 60;
    if (match[3]) seconds += parseInt(match[3]);

    return seconds;
}

async function getSpotifyLink(songLink) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(songLink, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Extend timeout to 60 seconds

    const spotifyLink = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('a'));
        const spotifyButton = buttons.find(el => el.href.includes('spotify'));
        return spotifyButton ? spotifyButton.href : null;
    });

    await browser.close();
    return spotifyLink;
}

router.post('/', async (req, res) => {
    const { youtubeLink } = req.body;
    const videoId = youtubeLink.split('v=')[1].split('&')[0];

    console.log('Processing YouTube link:', youtubeLink);
    console.log('Video ID:', videoId);

    try {
        const videoDuration = await getYouTubeVideoDuration(videoId);
        console.log('Video duration:', videoDuration);

        const skip = Math.floor((interval - 12) / 12);
        const response = await axios.post('https://enterprise.audd.io/', {
            api_token: auddApiKey,
            url: youtubeLink,
            accurate_offsets: 'true',
            skip: `${skip}`,
            every: '1',
        }, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const songs = response.data.result;

        if (!songs || songs.length === 0) {
            return res.status(400).json({ error: 'No songs identified' });
        }

        let spotifyLinks = [];
        let identifiedSongs = [];

        for (const chunk of songs) {
            for (const song of chunk.songs) {
                const spotifyLink = await getSpotifyLink(song.song_link);
                if (spotifyLink && !spotifyLinks.includes(spotifyLink)) {
                    spotifyLinks.push(spotifyLink);
                    identifiedSongs.push({ name: `${song.artist} - ${song.title}`, time: chunk.offset });
                }
            }
        }

        console.log('Identified songs:', identifiedSongs);
        console.log('Spotify links:', spotifyLinks);

        if (spotifyLinks.length === 0) {
            return res.status(400).json({ error: 'No Spotify links identified' });
        }

        res.json({ spotifyLinks, youtubeLink });
    } catch (error) {
        console.error('Error identifying songs:', error);
        res.status(500).json({ error: 'Error identifying songs' });
    }
});

module.exports = router;
