const apiBaseUrl = "https://api.themoviedb.org/3";
const apiKey = "cb8a14125765a6424087772a479efd86"
const imageBaseUrl = "https://image.tmdb.org/t/p/w300";

async function fetchMoviesNowPlaying() {
    const response = await fetch(`${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`);
    const jsonResponse = await response.json();
    const movies = jsonResponse.results;
    console.log(movies);
}

fetchMoviesNowPlaying();