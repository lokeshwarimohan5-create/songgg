// ==========================================
// SUPABASE CONFIGURATION
// ==========================================

// IMPORTANT:
// Replace these with your actual Supabase Project URL
// and Publishable/Anon key.

const SUPABASE_URL = "https://lopdckebjwrstejwytsl.supabase.co";
const SUPABASE_KEY = "sb_publishable_-QC_SqodH_mvanNYgBlaOA_TkLxuxT5";

// Create the Supabase client
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ==========================================
// ADMIN ELEMENTS
// ==========================================

const form = document.getElementById('addSongForm');
const adminSongList = document.getElementById('adminSongList');
const formMode = document.getElementById('formMode');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const editSongId = document.getElementById('editSongId');


// ==========================================
// INITIALIZE ADMIN PAGE
// ==========================================

async function initAdmin() {

    await fetchAdminSongs();

    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', resetForm);
    }
}


// ==========================================
// FETCH SONGS
// ==========================================

async function fetchAdminSongs() {

    try {

        const { data, error } = await supabaseClient
            .from('songs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        renderAdminSongs(data || []);

    } catch (error) {

        console.error("Error fetching songs:", error);

        if (adminSongList) {
            adminSongList.innerHTML = `
                <div style="padding: 20px; color: var(--danger);">
                    Failed to load songs.
                </div>
            `;
        }
    }
}


// ==========================================
// RENDER SONG LIST
// ==========================================

function renderAdminSongs(songs) {

    if (!adminSongList) {
        return;
    }

    if (songs.length === 0) {

        adminSongList.innerHTML = `
            <div style="padding: 20px; color: #b3b3b3;">
                No songs available.
            </div>
        `;

        return;
    }

    adminSongList.innerHTML = '';

    songs.forEach(song => {

        const defaultCover =
            'https://via.placeholder.com/40x40.png?text=N/A';

        const coverUrl =
            song.cover_url || defaultCover;

        const item = document.createElement('div');

        item.className = 'admin-song-item';

        item.innerHTML = `
            <img
                src="${coverUrl}"
                onerror="this.src='${defaultCover}'"
                alt="cover"
            >

            <div class="admin-song-info">

                <div style="font-weight: 600;">
                    ${song.title}
                </div>

                <div
                    style="
                        font-size: 0.85rem;
                        color: var(--text-secondary);
                    "
                >
                    ${song.artist}
                </div>

            </div>

            <div class="admin-song-actions">

                <button
                    class="btn-edit"
                    onclick="editSong('${song.id}')"
                >
                    <i class="fas fa-edit"></i>
                    Edit
                </button>

                <button
                    class="btn-delete"
                    onclick="deleteSong('${song.id}')"
                >
                    <i class="fas fa-trash"></i>
                    Delete
                </button>

            </div>
        `;

        adminSongList.appendChild(item);
    });
}


// ==========================================
// ADD / UPDATE SONG
// ==========================================

async function handleFormSubmit(e) {

    e.preventDefault();

    const songData = {

        title: document.getElementById('title').value.trim(),

        artist: document.getElementById('artist').value.trim(),

        album: document.getElementById('album').value.trim(),

        cover_url: document
            .getElementById('cover_url')
            .value
            .trim(),

        audio_url: document
            .getElementById('audio_url')
            .value
            .trim()
    };


    const id = editSongId.value;


    try {

        submitBtn.disabled = true;

        submitBtn.textContent = 'Saving...';


        // ======================================
        // UPDATE EXISTING SONG
        // ======================================

        if (id) {

            const { error } = await supabaseClient
                .from('songs')
                .update(songData)
                .eq('id', id);

            if (error) {
                throw error;
            }

            alert('Song updated successfully!');

        }


        // ======================================
        // INSERT NEW SONG
        // ======================================

        else {

            const { error } = await supabaseClient
                .from('songs')
                .insert([songData]);

            if (error) {
                throw error;
            }

            alert('Song added successfully!');
        }


        // Reset form
        resetForm();

        // Refresh songs
        await fetchAdminSongs();


    } catch (error) {

        console.error("Error saving song:", error);

        alert(
            "Error saving song.\n\n" +
            error.message
        );


    } finally {

        submitBtn.disabled = false;

        submitBtn.textContent = 'Save Song';
    }
}


// ==========================================
// EDIT SONG
// ==========================================

async function editSong(id) {

    try {

        const { data, error } = await supabaseClient
            .from('songs')
            .select('*')
            .eq('id', id)
            .single();


        if (error) {
            throw error;
        }


        // Populate form

        document.getElementById('title').value =
            data.title || '';

        document.getElementById('artist').value =
            data.artist || '';

        document.getElementById('album').value =
            data.album || '';

        document.getElementById('cover_url').value =
            data.cover_url || '';

        document.getElementById('audio_url').value =
            data.audio_url || '';


        // Store ID

        editSongId.value = data.id;


        // Update UI

        formMode.textContent = 'Edit';

        cancelEditBtn.style.display = 'block';


        // Scroll to top

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });


    } catch (error) {

        console.error(
            "Error fetching song for edit:",
            error
        );

        alert(
            "Could not load song details.\n\n" +
            error.message
        );
    }
}


// ==========================================
// DELETE SONG
// ==========================================

async function deleteSong(id) {

    const confirmed = confirm(
        'Are you sure you want to delete this song?'
    );


    if (!confirmed) {
        return;
    }


    try {

        const { error } = await supabaseClient
            .from('songs')
            .delete()
            .eq('id', id);


        if (error) {
            throw error;
        }


        alert('Song deleted successfully!');


        await fetchAdminSongs();


    } catch (error) {

        console.error(
            "Error deleting song:",
            error
        );

        alert(
            "Could not delete song.\n\n" +
            error.message
        );
    }
}


// ==========================================
// RESET FORM
// ==========================================

function resetForm() {

    if (form) {
        form.reset();
    }

    if (editSongId) {
        editSongId.value = '';
    }

    if (formMode) {
        formMode.textContent = 'Add New';
    }

    if (cancelEditBtn) {
        cancelEditBtn.style.display = 'none';
    }
}


// ==========================================
// START ADMIN PAGE
// ==========================================

document.addEventListener(
    'DOMContentLoaded',
    initAdmin
);