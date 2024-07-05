const socket = io();

document.getElementById('youtube-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const youtubeLink = document.getElementById('youtube-link').value;

    const response = await fetch('/youtube', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ youtubeLink }),
    });

    const data = await response.json();
    document.getElementById('playlist-result').innerText = JSON.stringify(data);
});

socket.on('new-song', (song) => {
    const songList = document.getElementById('song-list');
    const songItem = document.createElement('li');
    songItem.innerText = `${song.title} by ${song.artist}`;
    songList.appendChild(songItem);
});
