//You can edit ALL of the code here

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);

  document
    .getElementById("searchInput")
    .addEventListener("input", handleSearch);
}

function handleSearch() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const allEpisodes = getAllEpisodes();

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const name = episode.name.toLowerCase();
    const summary = episode.summary.toLowerCase();
    return name.includes(searchTerm) || summary.includes(searchTerm);
  });

  // Display the total and filtered episode count
  const listEpisodesElem = document.getElementById("listEpisodes");
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

  // Populate the dropdown
  episodeList.forEach((episode, index) => {
    const episodeDisplay = formatEpisodeDisplay(episode.season, episode.number);
    const option = document.createElement("option");
    option.value = index; // Set the index as the value for easy access later
    option.textContent = `${episodeDisplay} - ${episode.name} `;
    selector.appendChild(option);
  });

  // Event listener for the dropdown
  selector.addEventListener("change", function () {
    const selectedIndex = this.value;
    navigateToEpisode(episodeList, selectedIndex);
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
