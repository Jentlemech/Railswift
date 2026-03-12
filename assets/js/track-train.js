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

  function delayText(progress) {
    if (progress < 30) return "On time";
    if (progress < 60) return "Delayed by 8 minutes";
    return "Delayed by 14 minutes";
  }

  function nextStation(train, progress) {
    if (progress < 35) return train.fromStation;
    if (progress < 70) return "Mid-route operational halt";
    return train.toStation;
  }

  function etaText(train, progress) {
    return progress < 70 ? `ETA at ${train.toStation}: ${train.arrivalTime}` : `Expected arrival shortly at ${train.toStation}`;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    RP.hideMessage("trackMessage");

    const query = RP.byId("trackNumber").value.trim();
    const booking = RP.getBookings().find((row) => row.pnr === query);
    const number = booking ? String(booking.trainNumber) : query;
    const train = trains.find((row) => String(row.trainNumber) === number);

    if (!train) {
      result.classList.add("hidden");
      RP.showMessage("trackMessage", "Train or PNR not found. Please enter a valid train number or a booked PNR.", "error");
      return;
    }

    const progress = simulateProgress(number);
    const status = statusText(progress);

    result.classList.remove("hidden");
    result.innerHTML = `
      <h2>${train.trainName} (${train.trainNumber})</h2>
      <p class="muted">${train.fromStation} -> ${train.toStation} | Scheduled ${train.departureTime} - ${train.arrivalTime}</p>
      <div class="live-map-card">
        <div class="live-map-line">
          <span class="live-map-stop origin">${train.fromStation}</span>
          <span class="live-map-train" style="left:${progress}%;"><i class="fa-solid fa-train"></i></span>
          <span class="live-map-stop destination">${train.toStation}</span>
        </div>
      </div>
      <div class="track-progress-wrap">
        <div class="track-progress"><span style="width:${progress}%;"></span></div>
        <div class="track-progress-label"><span>${train.fromStation}</span><span>${train.toStation}</span></div>
      </div>
      <p><span class="badge badge-success">Live Status</span> ${status}</p>
      <div class="grid grid-2" style="margin-top:0.8rem;">
        <div class="ticket-field"><strong>Delay Status</strong>${delayText(progress)}</div>
        <div class="ticket-field"><strong>Next Station</strong>${nextStation(train, progress)}</div>
        <div class="ticket-field"><strong>Expected Arrival</strong>${etaText(train, progress)}</div>
        <div class="ticket-field"><strong>Tracking Input</strong>${booking ? `PNR ${query}` : `Train ${number}`}</div>
      </div>
    `;

    RP.showMessage("trackMessage", "Live train status refreshed.", "success");
  });

  loadTrains().then((dataset) => {
    trains = dataset;
  });
})();
