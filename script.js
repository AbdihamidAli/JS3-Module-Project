//You can edit ALL of the code here
function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  episodeList.forEach((episode) => {
    const episodeElem = document.createElement("div");
    episodeElem.classList.add("episode-container");

    const episodeDisplay = formatEpisodeDisplay(episode.season, episode.number);
    episodeElem.innerHTML = `
      <div class="episode-info" id="content">${episode.name} - ${episodeDisplay}</div>
      <img src="${episode.image.medium}" alt="${episode.name}" />
      <p>${episode.summary}</p>
    `;

    rootElem.appendChild(episodeElem);
  });
}

function formatEpisodeDisplay(season, number) {
  return `S${String(season).padStart(2, "0")}E${String(number).padStart(
    2,
    "0"
  )}`;
}

window.onload = setup;
