const express = require('express');
const axios = require('axios');
const { google } = require('googleapis');
const puppeteer = require('puppeteer');
const router = express.Router();
require('dotenv').config();

const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const auddApiKey = process.env.AUDD_API_KEY;
const interval = 60; // seconds

async function getYouTubeVideoDuration(videoId) {
    const youtube = google.youtube({
        version: 'v3',
        auth: youtubeApiKey
    });

    const response = await youtube.videos.list({
        part: 'contentDetails,snippet',
        id: videoId
    });

    const duration = response.data.items[0].contentDetails.duration;
    const title = response.data.items[0].snippet.title;
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

    let seconds = 0;
    if (match[1]) seconds += parseInt(match[1]) * 3600;
    if (match[2]) seconds += parseInt(match[2]) * 60;
    if (match[3]) seconds += parseInt(match[3]);

    return { seconds, title };
}

async function getSpotifyLink(songLink) {
    const browser = await puppeteer.launch();
    try {
        const page = await browser.newPage();
        await page.goto(songLink, { waitUntil: 'domcontentloaded', timeout: 60000 });

        const spotifyLink = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('a'));
            const spotifyButton = buttons.find(el => el.href.includes('spotify'));
            return spotifyButton ? spotifyButton.href : null;
        });

        return spotifyLink;
    } finally {
        await browser.close();
    }
}

router.post('/', async (req, res) => {
    const { youtubeLink } = req.body;
    const videoId = youtubeLink.split('v=')[1].split('&')[0];

    console.log('Processing YouTube link:', youtubeLink);

    try {
        const { seconds: videoDuration, title: videoTitle } = await getYouTubeVideoDuration(videoId);
        console.log(`Video duration: ${videoDuration}, Video title: ${videoTitle}`);

        const skip = 4; // 48 seconds skip
        const every = 1; // scan 12 seconds

        const data = {
            api_token: auddApiKey,
            url: youtubeLink,
            accurate_offsets: 'true',
            skip: skip,
            every: every
        };

        const response = await axios.post('https://enterprise.audd.io/', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        console.log('Audd.io API response:', response.data);

        const songs = response.data.result;

        if (!songs || songs.length === 0) {
            return res.status(400).json({ error: 'No songs identified' });
        }

        let spotifyLinksMap = new Map();

        for (const chunk of songs) {
            for (const song of chunk.songs) {
                const spotifyLink = await getSpotifyLink(song.song_link);
                if (spotifyLink) {
                    spotifyLinksMap.set(spotifyLink, { name: `${song.artist} - ${song.title}`, time: chunk.offset });
                }
            }
        }

        const spotifyLinks = Array.from(spotifyLinksMap.keys());

        console.log('Spotify links map:', spotifyLinksMap);

        if (spotifyLinks.length === 0) {
            return res.status(400).json({ error: 'No Spotify links identified' });
        }

        res.json({ spotifyLinks, youtubeLink, videoTitle });
    } catch (error) {
        console.error('Error identifying songs:', error);
        res.status(500).json({ error: 'Error identifying songs' });
    }
});

module.exports = router;
