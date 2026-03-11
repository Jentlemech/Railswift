(function () {
  const RP = window.RailPortal;
  const form = RP.byId("scheduleForm");
  const results = RP.byId("scheduleResults");
  if (!form || !results) return;

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

  function render(list) {
    if (!list.length) {
      results.innerHTML = '<p class="muted">No train schedule found for current filters.</p>';
      return;
    }

    results.innerHTML = list
      .slice(0, 80)
      .map(
        (train) => `
          <article class="train-item train-card-modern">
            <div class="train-head">
              <strong>${train.trainName} (${train.trainNumber})</strong>
              <span class="train-type-chip"><i class="fa-solid fa-train"></i> ${train.trainType}</span>
            </div>
            <p class="muted">${train.fromStation} -> ${train.toStation} | Departure ${train.departureTime} | Arrival ${train.arrivalTime}</p>
            <p class="muted">Duration: ${train.travelDuration} | Distance: ${train.distanceKm} km</p>
            <p class="muted">Running days: ${(train.runningDays || []).join(", ")}</p>
          </article>
        `
      )
      .join("");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    RP.hideMessage("scheduleMessage");

    const query = String(RP.byId("scheduleQuery").value || "").trim().toUpperCase();
    const from = String(RP.byId("scheduleFrom").value || "").trim().toUpperCase();
    const to = String(RP.byId("scheduleTo").value || "").trim().toUpperCase();

    const filtered = trains.filter((train) => {
      const number = String(train.trainNumber || "").toUpperCase();
      const name = String(train.trainName || "").toUpperCase();
      const fromPass = !from || String(train.fromStation || "").toUpperCase().includes(from);
      const toPass = !to || String(train.toStation || "").toUpperCase().includes(to);
      const queryPass = !query || number.includes(query) || name.includes(query);
      return fromPass && toPass && queryPass;
    });

    render(filtered);
    RP.showMessage("scheduleMessage", `Showing ${filtered.length} train schedules.`, "success");
  });

  loadTrains().then((dataset) => {
    trains = dataset;
    render(trains.slice(0, 20));
  });
})();
