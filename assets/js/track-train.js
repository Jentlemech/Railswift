(function () {
  const RP = window.RailPortal;
  const form = RP.byId("trackForm");
  const result = RP.byId("trackResult");
  if (!form || !result) return;

  let trains = [];

  async function loadTrains() {
    const paths = ["data/trains.json", "trains.json"];
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

  function simulateProgress(trainNumber) {
    const hash = String(trainNumber || "")
      .split("")
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    return 20 + (hash % 70);
  }

  function statusText(progress) {
    if (progress < 35) return "Departed from origin";
    if (progress < 70) return "Running on time";
    return "Approaching destination";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    RP.hideMessage("trackMessage");

    const number = RP.byId("trackNumber").value.trim();
    const train = trains.find((row) => String(row.trainNumber) === number);

    if (!train) {
      result.classList.add("hidden");
      RP.showMessage("trackMessage", "Train not found in tracking dataset.", "error");
      return;
    }

    const progress = simulateProgress(number);
    const status = statusText(progress);

    result.classList.remove("hidden");
    result.innerHTML = `
      <h2>${train.trainName} (${train.trainNumber})</h2>
      <p class="muted">${train.fromStation} -> ${train.toStation} | Scheduled ${train.departureTime} - ${train.arrivalTime}</p>
      <div class="track-progress-wrap">
        <div class="track-progress"><span style="width:${progress}%;"></span></div>
        <div class="track-progress-label"><span>${train.fromStation}</span><span>${train.toStation}</span></div>
      </div>
      <p><span class="badge badge-success">Live Status</span> ${status}</p>
      <p class="muted">Estimated current progress: ${progress}% of route completed.</p>
    `;

    RP.showMessage("trackMessage", "Live train status refreshed.", "success");
  });

  loadTrains().then((dataset) => {
    trains = dataset;
  });
})();
