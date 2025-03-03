const apiBaseUrl = "https://api.themoviedb.org/3";
const apiKey = "cb8a14125765a6424087772a479efd86";
const imageBaseUrl = "https://image.tmdb.org/t/p/w300";

const moviesGrid = document.getElementById("movies-grid");
const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");

let auth0;

async function login() {
    await auth0.loginWithRedirect();
}

async function logout() {
    auth0.logout({ returnTo: window.location.origin });
}

async function initializeAuth0() {
    auth0 = await window.auth0.createAuth0Client({
        domain: "dev-zmhc1lrotxctj33f.us.auth0.com",
        client_id: "S88z1rZwFBjQOwVSCtBdJfzoCjENCLio",
        redirect_uri: "http://127.0.0.1:5500/*"
    });

    await handleAuthCallback();
}

async function fetchMoviesNowPlaying() {
    const response = await fetch(`${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`);
    const jsonResponse = await response.json();
    const movies = jsonResponse.results;

    displayMovies(movies);
}

async function searchMovies(query) {
    const response = await fetch(`${apiBaseUrl}/search/movie?api_key=${apiKey}&query="${query}"`);
    const jsonResponse = await response.json();
    const movies = jsonResponse.results;

    displayMovies(movies);
}

function displayMovies(movies) {
    moviesGrid.innerHTML = movies.map(
        (movie) => 
            `
            <div class="movie-card">
                <img src="${imageBaseUrl}${movie.poster_path}"/>
                <p>⭐${movie.vote_average}</p>
                <h1>${movie.title}</h1>
            </div>
            `
    ).join("");
}

async function handleSearchFormSubmit(event) {
    event.preventDefault();
    const searchQuery = searchInput.value;
    await searchMovies(searchQuery);
}

async function handleAuthCallback() {
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        await auth0.handleRedirectCallback();
        window.history.replaceState({}, document.title, "/");
    }
}

async function getUser() {
    const user = await auth0.getUser();
    if (user) {
        console.log("User:", user);
        document.getElementById("user-info").innerText = `Logged in as ${user.name}`;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("search-form").addEventListener("submit", handleSearchFormSubmit);

    await initializeAuth0();
    await fetchMoviesNowPlaying();
});