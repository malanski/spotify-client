# Spotify-client API Fetch App

This is a simple app that utilizes the Spotify API to fetch and display information about music genres, playlists, and tracks. The app is built using JavaScript and does not require any server-side code as it directly interacts with the Spotify API.

## How the App Works

The app is divided into three modules:

1. **APIController**: This module handles all the API requests to Spotify. It has methods to fetch an access token, get a list of music genres, get playlists by genre, get a list of tracks for a specific playlist, and get detailed information about a track.

2. **UIController**: This module manages the user interface. It provides methods to interact with HTML elements such as genre and playlist select elements, track list, and song details. It also stores and retrieves the access token in/from a hidden input field.

3. **APPController**: This module integrates the APIController and UIController. It initializes the app, loads the genres on page load, handles genre change events, fetches playlists for the selected genre, and displays track details when a track is clicked.

## How to Use the App

1. **Authorization**: The app uses a client ID and client secret to obtain an access token from the Spotify API. The authorization is done privately in the APIController using the "client_credentials" grant type.

2. **Genres Selection**: When the app is loaded, it fetches the list of music genres using the access token. The genres are displayed in a select element. Selecting a genre will fetch the playlists for that genre.

3. **Playlists Selection**: After selecting a genre, the playlists associated with that genre are fetched. They are displayed in another select element. Choosing a playlist will load and display the list of tracks for that playlist.

4. **Track Selection**: Clicking on a track from the list of tracks will display the album cover, title, and artist for that track.

## Prerequisites

To use the app, you need to have the following:

- A valid Spotify account.
- Obtain a client ID and client secret by creating a Spotify App on the Spotify Developer Dashboard.

## Installation and Setup

1. Clone or download the project code.
2. Open the `index.html` file in your browser.

## Dependencies

The app does not require any external libraries or frameworks. It is built using vanilla JavaScript and utilizes Fetch API to interact with the Spotify API.

## Important Note

Please note that this app is intended for educational purposes and does not include any authentication for user-specific data. In a real-world application, a server-side implementation and user authentication would be necessary for security and user privacy.
