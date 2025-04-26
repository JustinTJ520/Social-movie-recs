const apiBaseUrl = "https://api.themoviedb.org/3";
const imageBaseUrl = "https://image.tmdb.org/t/p/w300";

const moviesGrid = document.getElementById("movies-grid");
const searchInput = document.getElementById("search-input");
const searchForm = document.getElementById("search-form");

const createAuth0Client = window.auth0.createAuth0Client;

let auth0Client = null;

const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0Client = await createAuth0Client({
    domain: config.domain,
    clientId: config.clientId,
  });
};

window.onload = async () => {
  await configureClient();

  updateUI();

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    return;
  }

  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {
    await auth0Client.handleRedirectCallback();

    updateUI();

    window.history.replaceState({}, document.title, "/");
  }
};

const updateUI = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;

  const userInfoDiv = document.getElementById("user-info");

  if (isAuthenticated) {
    document.getElementById("gated-content").classList.remove("hidden");

    const user = await auth0Client.getUser();

    document.getElementById(
      "username"
    ).textContent = `Welcome, ${user.nickname}`;
    document.getElementById("user-picture").src = user.picture;
    userInfoDiv.classList.remove("hidden");
  } else {
    document.getElementById("gated-content").classList.add("hidden");
    userInfoDiv.classList.add("hidden");
  }
};

const login = async () => {
  await auth0Client.loginWithRedirect({
    authorizationParams: {
      redirect_uri: window.location.origin,
    },
  });
};

const logout = () => {
  auth0Client.logout({
    logoutParams: {
      returnTo: window.location.origin,
    },
  });
};

async function fetchMoviesNowPlaying() {
  const response = await fetch(
    `${apiBaseUrl}/movie/now_playing?api_key=${apiKey}`
  );
  const jsonResponse = await response.json();
  const movies = jsonResponse.results;

  displayMovies(movies);
}

async function searchMovies(query) {
  const response = await fetch(
    `${apiBaseUrl}/search/movie?api_key=${apiKey}&query=${query}`
  );
  const jsonResponse = await response.json();
  const movies = jsonResponse.results;

  displayMovies(movies);
}

function displayMovies(movies) {
  moviesGrid.innerHTML = movies
    .map(
      (movie) =>
        `
            <div class="movie-card">
                <img src="${imageBaseUrl}${movie.poster_path}" alt="${movie.title}"/>
                <p>⭐${movie.vote_average}</p>
                <h1>${movie.title}</h1>
            </div>
            `
    )
    .join("");
}

async function handleSearchFormSubmit(event) {
  event.preventDefault();
  const searchQuery = searchInput.value;
  await searchMovies(searchQuery);
}

searchForm.addEventListener("submit", handleSearchFormSubmit);
fetchMoviesNowPlaying();
