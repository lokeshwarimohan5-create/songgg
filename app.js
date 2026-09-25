// State
let songs = [];
let currentSongIndex = -1;
let isPlaying = false;

// DOM Elements
const songGrid = document.getElementById('songGrid');
const searchInput = document.getElementById('searchInput');

// Player DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const btnPlayPause = document.getElementById('btnPlayPause');
const playIcon = document.getElementById('playIcon');
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');

const npCover = document.getElementById('npCover');
const npTitle = document.getElementById('npTitle');
const npArtist = document.getElementById('npArtist');

// Initialize
async function init() {
    await fetchSongs();
    setupEventListeners();
}

// Fetch songs from Supabase
async function fetchSongs() {
    try {
        const { data, error } = await window.supabaseClient
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        songs = data || [];
        renderSongs(songs);
    } catch (error) {
        console.error("Error fetching songs:", error);
        songGrid.innerHTML = `<div style="color: var(--danger);">Failed to load songs. Make sure Supabase is configured and tables exist.</div>`;
    }
}

// Render songs to grid
function renderSongs(songsToRender) {
    if (songsToRender.length === 0) {
        songGrid.innerHTML = `<div style="color: #b3b3b3;">No songs found. Head to the Admin panel to add some!</div>`;
        return;
    }

    songGrid.innerHTML = '';
    songsToRender.forEach((song, index) => {
        // Find original index in the main array for playing
        const originalIndex = songs.findIndex(s => s.id === song.id);
        
        const card = document.createElement('div');
        card.className = 'song-card';
        card.onclick = () => playSong(originalIndex);
        
        const defaultCover = 'https://via.placeholder.com/300x300.png?text=No+Cover';
        const coverUrl = song.cover_url || defaultCover;

        card.innerHTML = `
            <img src="${coverUrl}" alt="${song.title}" class="song-cover" onerror="this.src='${defaultCover}'">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
        `;
        songGrid.appendChild(card);
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = songs.filter(song => 
            song.title.toLowerCase().includes(term) || 
            song.artist.toLowerCase().includes(term) ||
            (song.album && song.album.toLowerCase().includes(term))
        );
        renderSongs(filtered);
    });

    // Player Controls
    btnPlayPause.addEventListener('click', togglePlay);
    btnNext.addEventListener('click', playNext);
    btnPrev.addEventListener('click', playPrev);

    // Audio Events
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('ended', playNext);
    audioPlayer.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audioPlayer.duration);
    });

    // Progress Bar Interaction
    progressBar.addEventListener('click', (e) => {
        if (!audioPlayer.src || audioPlayer.readyState === 0) return;
        const width = progressBar.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    });

    // Volume Control
    volumeSlider.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
        updateVolumeIcon();
    });
}

// Player Functions
function playSong(index) {
    if (index < 0 || index >= songs.length) return;
    
    currentSongIndex = index;
    const song = songs[currentSongIndex];
    
    // Update UI
    const defaultCover = 'https://via.placeholder.com/56x56.png?text=No+Cover';
    npCover.src = song.cover_url || defaultCover;
    npCover.style.opacity = '1';
    npTitle.textContent = song.title;
    npArtist.textContent = song.artist;
    
    // Play Audio
    audioPlayer.src = song.audio_url;
    audioPlayer.play().then(() => {
        isPlaying = true;
        updatePlayIcon();
    }).catch(err => {
        console.error("Error playing audio:", err);
        alert("Could not play the audio file. Check the URL.");
    });
}

function togglePlay() {
    if (currentSongIndex === -1 && songs.length > 0) {
        playSong(0);
        return;
    }
    
    if (audioPlayer.paused) {
        audioPlayer.play();
        isPlaying = true;
    } else {
        audioPlayer.pause();
        isPlaying = false;
    }
    updatePlayIcon();
}

function playNext() {
    if (songs.length === 0) return;
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= songs.length) nextIndex = 0; // Loop back to start
    playSong(nextIndex);
}

function playPrev() {
    if (songs.length === 0) return;
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = songs.length - 1; // Loop to end
    playSong(prevIndex);
}

function updatePlayIcon() {
    if (isPlaying) {
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    } else {
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    }
}

function updateProgress() {
    const { duration, currentTime } = audioPlayer;
    if (isNaN(duration)) return;
    
    const percent = (currentTime / duration) * 100;
    progressFill.style.width = `${percent}%`;
    currentTimeEl.textContent = formatTime(currentTime);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function updateVolumeIcon() {
    const v = audioPlayer.volume;
    volumeIcon.className = '';
    if (v === 0) volumeIcon.className = 'fas fa-volume-mute';
    else if (v < 0.5) volumeIcon.className = 'fas fa-volume-down';
    else volumeIcon.className = 'fas fa-volume-up';
}

// Start
document.addEventListener('DOMContentLoaded', init);
