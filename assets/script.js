const APIController = (function() {
    const clientId = '';
    const clientSecret = '';
    
    const _getToken = async () => {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: "POST",
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Authorization' : 'Basic' + btoa(clientId+ ':' + clientSecret)
            },
            body: 'grant_type-client_credentials'
    
        });

        const data = await result.json();
        return data.access_token;
    }
    
// Get genres token parameter 
    const _getGenres = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=sv_US`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        const data = await result.json()
        return data.categories.items;
    }

// Get genreId token parameter 
    const _getPlaylistGenres = async (token, genreId) => {

        const limit = 10; // Amound fo playlist we'll receive

        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        const data = await result.json()
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {
// tracksEndPoint are include in the data set we receive when we first pull the playlist
// whe a user select a playlist we track the API endpoints attached to the playlist object
        const limit = 10; // Amound fo playlist we'll receive

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });


        const data = await result.json() // JSON converts to array
        return data.items; // returns the array object
    }

// Specific track
    const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json()
        return data;
    }

    return {
        getToken() {
            return _getToken()
        },
        getGenres(token) {
            return _getGenres(token)
        },
        getPlaylistGenres(token, genreId) {
            return _getPlaylistGenres(token, genreId)
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint)
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint)
        }
    }
})();

// User Interface Module
const UIController = (function() {

// All the HTML references in one object
    const DOMElements = {
        selectGengre   : '#select_genre',
        selectPlaylist : '#select_playlist',
        buttonSubmit   : '#btn_submit',
        divSongDetail  : '#song-detail',
        hftoken        : '#hidden_token',
        divSongList    : '.song-list'
    }

    // public Method
    return {

        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGengre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSongList),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        // Method to select list option

        createGenre(text, value) {
            const html = `<option value="${value}>${text}</option>`;
            document.querySelector(DOMElements.selectGengre).insertAdjacentHTML("beforeend", html);
        },
        createPlaylist(text, value) {
            const html = `<option value="${value}>${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML("beforeend", html);
        },

        // Method to create Track list group item
        createTrack(id, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id=${id}>${name}</a>`;
            document.querySelector(DOMElements.divSongList).insertAdjacentHTML("beforeend", html);
        },

        // Method to create Song Detail 
        createSongDetail(img, title, artist) {
            const detailDiv = document.querySelector(DOMElements.divSongDetail)
            
            // Clear out detail div to receive new info
            detailDiv.innerHTML = ''

            const html = 
                `
                    <div class="row col-sm-12 px-0">
                        <img src="${img}" alt="Album cover">
                    </div>

                    <div class="row col-sm-12 px-0">
                        <label for="Genre" class="form-label col-sm-12">${title}</label>
                    </div>

                    <div class="row col-sm-12 px-0">
                        <label for="artist" class="form-label col-sm-12">By ${artist}</label>
                    </div>
                `;

            detailDiv.insertAdjacentHTML("beforeend", html);
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().song.innerHTML = '';
            this.resetTrackDetail().songDetail.innerHTML = '';
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },
        storeToken(value) {
            document.querySelector(DOMElements.hftoken).value = value;
        },
        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hftoken).value
            }
        }
    }
})

// integration Module
// get genres on Page Load
const APPController = (function(UICtrl, APICtrl) {
    const DOMInputs = UICtrl.inputField();

    const loadGenres = async () => {
        // get the Token
        const token = await APICtrl.getToken();
        UICtrl.storeToken(token); // Store Token

        // get the Genres
        const genres = await APICtrl.getGenres(token);
        // populate our elements
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

// Genres change event
    DOMInputs.genre.addEventListener('change', async () => {
        // User change = we need to reset
        UICtrl.resetPlaylist();
        //get the token, add method to store token on the page
        const token = UICtrl.getStoredToken().token;
        // got genreselected field
        const genreSelect = UICtrl.inputField().genre;
        // get the selected genreId
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;
        // get playlist data from spotify based on genre
        const playlist = await APICtrl.getPlaylistGenres(token, genreId);
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));

    });

// Submit Button event
    DOMInputs.submit.addEventListener('click', async (e) => {
        e.preventDefault();
        
        UICtrl.resetTracks();

        const token = UICtrl.getStoredToken().token;

        // got genreselected field
        const playlistSelect = UICtrl.inputField().playlist;

        // get the selected genreId
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        
        // get playlist data from spotify based on genre
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);

        tracks.forEach(el = UICtrl.createTrack(el.track.href, el.track.nae))
    });

    DOMInputs.tracks.addEventListener('click', async (e) => {

        e.preventDefault();
        UICtrl.resetTrackDetail();
        const token = UICtrl.getStoredToken().token;

        const trackEndpoint = e.target.id;

        const track = await APICtrl.getTrack(token, trackEndpoint);

        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);


    });
    return {
        init() {
            console.log("App is Starting!");
            loadGenres();
        }
    }
})(UIController, APIController);

APPController.init();