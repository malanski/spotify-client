const APIController = (function() {

    const clientId = '38c5b6a8d29c45649ef0183b0fc9a7ba';
    const clientSecret = '328ae93c4a8c478d81cb5749a99ef5ef'; 
    
// private Method
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type'  : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
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

        const data = await result.json();
        return data.categories.items;
    }

// Get genreId token parameter 
    const _getPlaylistByGenre = async (token, genreId) => {

        const limit = 10;
        
            const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {
// tracksEndPoint are include in the data set we receive when we first pull the playlist
// whe a user select a playlist we track the API endpoints attached to the playlist object
    const limit = 10;

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

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})();

// User Interface Module
const UIController = (function() {

// All the HTML references in one object
    const DOMElements = {
        selectGenre   : '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit  : '#btn_submit',
        divSongDetail : '#song-detail',
        hfToken       : '#hidden_token',
        divSonglist   : '.song-list'
    }

    // public Method
    return {

        inputField() {
            return {
                genre     : document.querySelector(DOMElements.selectGenre),
                playlist  : document.querySelector(DOMElements.selectPlaylist),
                tracks    : document.querySelector(DOMElements.divSonglist),
                submit    : document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        // Method to select list option

        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        },

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        // Method to create Track list group item
        createTrack(id, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        // Method to create Song Detail 
        createTrackDetail(img, title, artist) {

            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            // any time user clicks a new song, we need to clear out the song detail div
            detailDiv.innerHTML = '';

            const html = 
                `
                    <div class="row col-sm-12 px-0">
                        <img class="album-cover" src="${img}" alt="">        
                    </div>
                    <div class="row col-sm-12 px-0">
                        <label for="Genre" class="form-label col-sm-12">${title}</label>
                    </div>
                    <div class="row col-sm-12 px-0">
                        <label for="artist" class="form-label col-sm-12">By: ${artist}</label>
                    </div> 
                `;

            detailDiv.insertAdjacentHTML('beforeend', html)
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },
        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }
})();

// integration Module
// get genres on Page Load
const APPController = (function(UICtrl, APICtrl) {

    const DOMInputs = UICtrl.inputField();

    // get genres on page load
    const loadGenres = async () => {
        //get the token
        const token = await APICtrl.getToken();           
        //store the token onto the page
        UICtrl.storeToken(token);
        //get the genres
        const genres = await APICtrl.getGenres(token);
        //populate our genres select element
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

// Genres change event
    // create genre change event listener
    DOMInputs.genre.addEventListener('change', async () => {
        //reset the playlist
        UICtrl.resetPlaylist();
        //get the token that's stored on the page
        const token = UICtrl.getStoredToken().token;        
        // get the genre select field
        const genreSelect = UICtrl.inputField().genre;       
        // get the genre id associated with the selected genre
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
        // ge the playlist based on a genre
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);       
        // create a playlist list item for every playlist returned
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
    });

// Submit Button event
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        // clear tracks
        UICtrl.resetTracks();
        //get the token
        const token = UICtrl.getStoredToken().token;        
        // get the playlist field
        const playlistSelect = UICtrl.inputField().playlist;
        // get track endpoint based on the selected playlist
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        // get the list of tracks
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        // create a track list item
        tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name))
        
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