const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const youtubeRoute = require('./routes/youtube');
const auddRoute = require('./routes/audd');
const spotifyRoute = require('./routes/spotify');
const downloadRoute = require('./routes/download');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const client_id = 'f5444228ca1a48d2acb386cbfa39d8e3'; // Your Client ID
const client_secret = '696634cabebe467185ce6a57445ae3f2'; // Your Client Secret
const redirect_uri = 'http://localhost:3000/callback'; // Your redirect URI

let accessToken = '';
let refreshToken = '';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to add socket.io to requests
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get('/login', (req, res) => {
    const scope = 'playlist-modify-public playlist-modify-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            scope: scope,
            redirect_uri: redirect_uri
        }));
});

app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
        },
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
        }
    };

    try {
        const response = await axios.post(authOptions.url, querystring.stringify(authOptions.form), {
            headers: authOptions.headers,
        });

        accessToken = response.data.access_token;
        refreshToken = response.data.refresh_token;

        console.log('Access Token:', accessToken);
        console.log('Refresh Token:', refreshToken);

        // Redirect or render a success page
        res.json({ accessToken, refreshToken });
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.redirect('/#' +
            querystring.stringify({
                error: 'invalid_token'
            }));
    }
});

async function refreshAccessToken() {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        },
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64')
        }
    };

    try {
        const response = await axios.post(authOptions.url, querystring.stringify(authOptions.form), {
            headers: authOptions.headers,
        });

        accessToken = response.data.access_token;
        console.log('New Access Token:', accessToken);
    } catch (error) {
        console.error('Error refreshing access token:', error);
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/youtube', youtubeRoute);
app.use('/audd', auddRoute);
app.use('/spotify', spotifyRoute);

server.listen(3000, () => {
    console.log('App is listening on port 3000');
});