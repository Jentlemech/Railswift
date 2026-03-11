(function () {
  const RP = window.RailPortal;
  const grid = RP.byId("destinationsPageGrid");
  const insights = RP.byId("destinationsPageInsights");
  if (!grid || !insights) return;

  let trainsDataset = [];

  function parseDurationToMinutes(durationText) {
    const match = String(durationText || "").match(/(\d+)\s*h\s*(\d+)\s*m/i);
    if (!match) return Number.MAX_SAFE_INTEGER;
    return Number(match[1]) * 60 + Number(match[2]);
  }

  function bestFare(train) {
    const fares = Object.values(train.baseFares || {}).map((value) => Number(value)).filter((value) => !Number.isNaN(value));
    if (!fares.length) return Number.MAX_SAFE_INTEGER;
    return Math.min(...fares);
  }

  async function loadData(paths) {
    for (const path of paths) {
      try {
        const response = await fetch(path);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) return data;
        }
      } catch (_e) {
        // continue
      }
    }
    return [];
  }

  async function chooseFromStation() {
    const cached = localStorage.getItem("rp_recent_from_code") || "NDLS";
    const station = await RP.getStationByCode(cached);
    return station || { stationCode: "NDLS", stationName: "New Delhi" };
  }

  async function showInsights(destination) {
    const from = await chooseFromStation();
    const routes = trainsDataset
      .filter((train) => String(train.toStation).toUpperCase() === String(destination.nearest_code).toUpperCase())
      .sort((a, b) => parseDurationToMinutes(a.travelDuration) - parseDurationToMinutes(b.travelDuration));

    const topFast = routes.slice(0, 3);
    const best = [...routes].sort((a, b) => bestFare(a) - bestFare(b))[0];
    const date = new Date().toISOString().slice(0, 10);

    insights.classList.remove("hidden");
    insights.innerHTML = `
      <h3>${destination.name} - Train Suggestions</h3>
      <p class="muted">Nearest station: ${destination.nearest_station} | Current boarding preference: ${from.stationName} (${from.stationCode})</p>
      ${best ? `<p><span class="badge badge-success">Best Fare</span> ${best.trainName} (${best.trainNumber})</p>` : ""}
      <div class="insight-train-grid">
        ${
          topFast.length
            ? topFast
                .map(
                  (train) => `
                <article class="ticket-field">
                  <strong>${train.trainName} (${train.trainNumber})</strong>
                  <p class="muted">${train.fromStation} -> ${train.toStation} | ${train.departureTime} - ${train.arrivalTime}</p>
                  <p class="muted">Duration: ${train.travelDuration} | Starting Fare: INR ${Math.round(bestFare(train))}</p>
                </article>`
                )
                .join("")
            : '<p class="muted">No mapped direct trains in sample dataset. Use Explore Trains for live search.</p>'
        }
      </div>
      <div class="insight-actions">
        <a class="btn" href="booking.html?from=${from.stationCode}&to=${destination.nearest_code}&date=${date}&travelClass=3A&quota=General">Explore Trains</a>
      </div>
    `;
  }

  function renderCards(destinations) {
    grid.innerHTML = destinations
      .map(
        (destination) => `
          <article class="destination-card" data-destination="${destination.slug}">
            <img loading="lazy" src="${destination.image}" alt="${destination.name}" />
            <div class="destination-card-content">
              <h3>${destination.name}</h3>
              <p>${destination.description}</p>
              <p class="muted">Nearest: ${destination.nearest_station}</p>
              <button type="button" class="btn destination-explore-btn" data-destination="${destination.slug}">Explore Trains</button>
            </div>
          </article>
        `
      )
      .join("");

    grid.querySelectorAll(".destination-explore-btn").forEach((btn) => {
      btn.addEventListener("click", function () {
        const slug = btn.getAttribute("data-destination");
        const destination = destinations.find((item) => item.slug === slug);
        if (!destination) return;
        showInsights(destination);
      });
    });
  }

  Promise.all([loadData(["data/destinations.json", "destinations.json"]), loadData(["data/trains.json", "trains.json"])]).then(
    ([destinations, trains]) => {
      trainsDataset = trains;
      renderCards(destinations);
    }
  );
})();
