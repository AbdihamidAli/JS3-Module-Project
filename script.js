//You can edit ALL of the code here

function fetchApi() {
  const rootElem = document.getElementById("root");
  const errorMessage =
    '<div class="message error">Failed to fetch episodes. Please try again later.</div>';

  return fetch("https://api.tvmaze.com/shows/82/episodes")
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

console.log(fetchApi());

async function getAllEpisodes() {
  let data = await fetchApi();
  return data;
}

function setup() {
  getAllEpisodes().then((allEpisodes) => {
    makePageForEpisodes(allEpisodes);
    handleSearch();

    document
      .getElementById("searchInput")
      .addEventListener("input", handleSearch);
  });
}
const listEpisodesElem = document.getElementById("listEpisodes");

async function handleSearch() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const allEpisodes = await getAllEpisodes(); // Wait for the Promise to resolve

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = episode.summary.toLowerCase();
    return name.includes(searchTerm) || summary.includes(searchTerm);
  });

  // Display the total and filtered episode count
  listEpisodesElem.textContent = `Displaying ${filteredEpisodes.length}/${allEpisodes.length} episode(s)`;
  makePageForEpisodes(filteredEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  // Clear previous content
  rootElem.innerHTML = "";

  // Get the dropdown element
  const selector = document.getElementById("episodeSelector");
  selector.innerHTML = ""; // Clear existing options
  // Add "Show All Episodes" option
  const allEpisodesOption = document.createElement("option");
  allEpisodesOption.value = "all";
  allEpisodesOption.textContent = "Show All Episodes";
  selector.appendChild(allEpisodesOption);

  // Fetch all episodes again
  getAllEpisodes().then((allEpisodes) => {
    // Populate the dropdown
    allEpisodes.forEach((episode, index) => {
      const episodeDisplay = formatEpisodeDisplay(
        episode.season,
        episode.number
      );
      const option = document.createElement("option");
      option.value = index; // Set the index as the value for easy access later
      option.textContent = `${episodeDisplay} - ${episode.name} `;
      selector.appendChild(option);
    });

    // Event listener for the dropdown
    selector.addEventListener("change", function () {
      const selectedIndex = this.value;

      if (selectedIndex === "all") {
        // If "Show All Episodes" option is selected, display all episodes
        makePageForEpisodes(allEpisodes);
        listEpisodesElem.textContent = `Displaying ${allEpisodes.length}/${allEpisodes.length} episode(s)`;
      } else {
        // Otherwise, navigate to the selected episode
        navigateToEpisode(allEpisodes, selectedIndex);
        listEpisodesElem.textContent = `Displaying 1/${allEpisodes.length} episode(s)`;
      }
    });

    // Display the episodes
    episodeList.forEach((episode) => {
      const episodeElem = document.createElement("div");
      episodeElem.classList.add("episode-container");

      const episodeDisplay = formatEpisodeDisplay(
        episode.season,
        episode.number
      );
      episodeElem.innerHTML = `
        <div class="episode-info">${episode.name} - ${episodeDisplay}</div>
        <img src="${episode.image.medium}" alt="${episode.name}" />
        <p>${episode.summary}</p>
      `;

      rootElem.appendChild(episodeElem);
    });
  });
}


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

window.onload = setup;
