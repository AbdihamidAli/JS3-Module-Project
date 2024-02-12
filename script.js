//You can edit ALL of the code here

// Fetches show data from the API

function fetchShows() {
  return fetch("https://api.tvmaze.com/shows")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching shows:", error);
      throw error;
    });
}
///////////////////////////////

function fetchEpisodes(showId) {
  const rootElem = document.getElementById("root");
  const errorMessage =
    '<div class="message error">Failed to fetch episodes. Please try again later.</div>';

  return fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      rootElem.innerHTML = ""; // Clear any previous error message
      return data;
    })
    .catch((error) => {
      console.error("Error fetching episodes:", error);
      rootElem.innerHTML = errorMessage; // Display error message
      throw error; // Re-throw the error to propagate it further if needed
    });
}
/////////////////////////////////

// Populates the "showSelector" dropdown with show options
function populateShowDropdown(showData) {
  const selector = document.getElementById("showSelector");
  selector.innerHTML = ""; // Clear existing options

  // Add an initial option
  const initialOption = document.createElement("option");
  initialOption.value = ""; // You can set this value as needed
  initialOption.textContent = "Select a show";
  initialOption.setAttribute("disabled", true);
  initialOption.setAttribute("selected", true);
  selector.appendChild(initialOption);

  // Sort showData alphabetically by show name
  showData.sort((a, b) => a.name.localeCompare(b.name));

  showData.forEach((show) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    selector.appendChild(option);
  });

  // Add event listener for show selection
  selector.addEventListener("change", handleShowSelection);
}
/////////////////////////////////////////////
// Asynchronously retrieves all shows
async function getAllShows() {
  const data = await fetchShows();
  return data;
}

// Asynchronously retrieves all episodes for a specific show ID
async function getAllEpisodes(showId) {
  if (!showId) {
    // If showId is not provided, use the currently selected show in the dropdown
    showId = document.getElementById("showSelector").value;
  }

  const data = await fetchEpisodes(showId);
  return data;
}

////////////////////////////////////////
// Displays the shows on the page
function makePageForShows(shows) {
  const rootElem = document.getElementById("root");

  // Clear previous content
  rootElem.innerHTML = "";

  // Display the shows
  shows.forEach((show) => {
    const showElem = document.createElement("div");
    showElem.classList.add("show-container");

    const rating = show.rating.average ? show.rating.average.toFixed(1) : "N/A";
    const starRating = getStarRating(rating);

    showElem.innerHTML = `
      <div class="show-info">
        <p>${show.name}</p>
      </div>
      <img src="${show.image.medium}" alt="${show.name}" data-show-id="${show.id}" />
      <div class="rating-info">
        <p>Rating: ${rating} ${starRating}</p>
      </div>
    `;

    rootElem.appendChild(showElem);
  });

  // Add click event listeners to show elements
  const showElements = document.querySelectorAll(".show-container, .show-info");
  showElements.forEach((showElement) => {
    showElement.addEventListener("click", (event) => handleShowClick(event));
  });

  // Add cursor pointer style to show containers
  const showContainers = document.querySelectorAll(".show-container");
  showContainers.forEach((container) => {
    container.style.cursor = "pointer";
  });
}

// Function to generate star emoji based on the rating
function getStarRating(rating) {
  const maxRating = 10;
  const filledStars = Math.round((rating / maxRating) * 5);
  const emptyStars = 5 - filledStars;

  const starIcon = '⭐️'; // Filled star emoji
  const emptyStarIcon = '☆'; // Empty star emoji

  return starIcon.repeat(filledStars) + emptyStarIcon.repeat(emptyStars);
}

// Handles the event when a show is clicked
function handleShowClick(event) {
  const showId = event.target.getAttribute("data-show-id");

  if (showId) {
    // Fetch episodes for the selected show
    getAllEpisodes(showId).then((allEpisodes) => {
      makePageForEpisodes(allEpisodes);
      listEpisodesElem.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episode(s)`;
    });
  }
}

//////////////////////////////////////////

function setup() {
  // Display shows in a dropdown
  getAllShows().then((allShows) => {
    populateShowDropdown(allShows);

    // Display shows on the page
    makePageForShows(allShows);

    // Set up event listener for show selection
    const showSelector = document.getElementById("showSelector");

    showSelector.addEventListener("change", function () {
      const selectedShowId = this.value;
      if (selectedShowId === "selectAShow") {
        // Show selected is the placeholder, do nothing
        return;
      }

      // Fetch episodes for the selected show
      getAllEpisodes(selectedShowId).then((allEpisodes) => {
        makePageForEpisodes(allEpisodes);
        listEpisodesElem.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episode(s)`;
      });
    });
    const selector = document.getElementById("episodeSelector");
    console.log(selector);
    selector.style.display = "none";
  });

  // Additional setup, if needed
  handleSearch();
  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);

  // Add event listener for home button
  document
    .getElementById("home")
    .addEventListener("click", handleHomeButtonClick);

  // Display shows on the page
  getAllShows().then((allShows) => {
    populateShowDropdown(allShows);
    makePageForShows(allShows);
  });
}
//////////////////////////////////

const listEpisodesElem = document.getElementById("listEpisodes");

async function handleSearch() {
  try {
    const searchTerm = document
      .getElementById("searchInput")
      .value.trim()
      .toLowerCase();
    const selector = document.getElementById("episodeSelector");
    const selectedOption = selector.options[selector.selectedIndex].value;

    if (selectedOption === "all") {
      // User is viewing all episodes
      const allEpisodes = await getAllEpisodes();
      const filteredEpisodes = allEpisodes.filter((episode) => {
        const name = episode.name.toLowerCase();
        const summary = episode.summary.toLowerCase();
        return name.includes(searchTerm) || summary.includes(searchTerm);
      });

      listEpisodesElem.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episode(s)`;
      makePageForEpisodes(filteredEpisodes);
    } else {
      // User is viewing a list of shows
      const allShows = await getAllShows();
      const filteredShows = allShows.filter((show) => {
        const name = show.name.toLowerCase();
        return name.includes(searchTerm);
      });

      // Display the total and filtered show count
      listEpisodesElem.textContent = `Displaying ${filteredShows.length}/${allShows.length} show(s)`;

      // Update this part based on how you display shows on your page
      // For example, call a function to render the filtered shows on the page
      makePageForShows(filteredShows);

      // Also, search episodes based on the same search term
      const allEpisodes = await getAllEpisodes();
      const filteredEpisodes = allEpisodes.filter((episode) => {
        const name = episode.name.toLowerCase();
        const summary = episode.summary.toLowerCase();
        return name.includes(searchTerm) || summary.includes(searchTerm);
      });

      // Display the total and filtered episode count
      listEpisodesElem.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episode(s)`;
      makePageForEpisodes(filteredEpisodes);
    }
  } catch (error) {
    console.error("Error handling search:", error);
    // Handle the error, e.g., display an error message to the user
  }
}
/////////////////////////////////////////

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear previous content
  rootElem.innerHTML = "";

  // Get the dropdown element
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = ""; // Clear existing options

  // Populate the dropdown with episodes
  episodeList.forEach((episode, index) => {
    const episodeDisplay = formatEpisodeDisplay(episode.season, episode.number);
    const option = document.createElement("option");
    option.value = index;
    option.textContent = `${episodeDisplay} - ${episode.name} `;
    selector.appendChild(option);
  });

  // Event listener for the dropdown
  selector.addEventListener("change", function () {
    const selectedIndex = this.value;

    if (selectedIndex === "all") {
      // If "Show All Episodes" option is selected, display all episodes
      makePageForEpisodes(episodeList);
      listEpisodesElem.textContent = `Displaying ${episodeList.length}/${episodeList.length} episode(s)`;
    } else {
      // Otherwise, navigate to the selected episode
      navigateToEpisode(episodeList, selectedIndex);
      listEpisodesElem.textContent = `Displaying 1/${episodeList.length} episode(s)`;
    }
  });

  // Display the episodes
  episodeList.forEach((episode) => {
    const episodeElem = document.createElement("div");
    episodeElem.classList.add("episode-container");

    const episodeDisplay = formatEpisodeDisplay(episode.season, episode.number);
    episodeElem.innerHTML = `
      <div class="episode-info">${episode.name} - ${episodeDisplay}</div>
      <img src="${episode.image.medium}" alt="${episode.name}" />
      <p>${episode.summary}</p>
    `;

    rootElem.appendChild(episodeElem);
  });

  selector.style.display = "block";
}

////////////////////////////////////////////

function navigateToEpisode(episodeList, index) {
  // Hide all episodes
  const episodeElements = document.querySelectorAll(".episode-container");
  episodeElements.forEach((episodeElement) => {
    episodeElement.style.display = "none";
  });

  // Display the selected episode
  const selectedEpisodeElem = document.querySelector(
    `.episode-container:nth-child(${parseInt(index) + 1})`
  );
  if (selectedEpisodeElem) {
    selectedEpisodeElem.style.display = "block";
  }
}

function formatEpisodeDisplay(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(
    2,
    "0"
  )}`;
}
/////////////////////////////////////////

// Handles the event when a new show is selected
function handleShowSelection() {
  const selectedShowId = document.getElementById("showSelector").value;

  getAllEpisodes(selectedShowId).then((allEpisodes) => {
    makePageForEpisodes(allEpisodes);
    listEpisodesElem.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episode(s)`;
  });
}

// Handles the event when the home button is clicked
function handleHomeButtonClick() {
  location.reload(); // Reload the page to reset to the initial state
}

window.onload = setup;
